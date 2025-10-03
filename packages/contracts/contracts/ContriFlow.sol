// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";
import { IInterchainTokenService } from "@axelar-network/interchain-token-service/contracts/interfaces/IInterchainTokenService.sol";
import "./Helpers.sol";   


contract ContriFlow is ReentrancyGuard, Ownable, AutomationCompatibleInterface {
    using Helpers for *; 

    IERC20 public immutable token;
    address private bot;
    uint256 public constant MIN_BALANCE = 0.1 ether;
    uint256 public constant GAS_LIMIT = 200000;
    IAxelarGasService public immutable gasService;
    address immutable interchainTokenService;

    event DepositAdded(address indexed ownerAddress, uint256 amountWei);
    event DepositRemoved(address indexed ownerAddress, uint256 amountWei);

    event VoucherStored(
        address indexed ownerAddress,
        uint256 indexed repoGithubId,
        uint256 indexed contributorGithubId,
        uint256 ownerGithubId,
        uint256 prNumber,
        uint256 tokenAmountIn18dec,
        bytes32 hash
    );

    event ClaimRequested(
        bytes32 indexed voucherHash,
        uint256 indexed repoGithubId,
        uint256 indexed prNumber,
        address requester,
        address ownerAddress,
        uint256 ownerGithubId,
        uint256 tokenAmount,
        uint256 platformFee,
        Helpers.Chain destinationChain
    );

    event ClaimFinalized(
        bytes32 indexed voucherHash,
        uint256 indexed repoGithubId,
        uint256 indexed prNumber,
        address claimant,
        uint256 tokenAmount,
        Helpers.Chain destinationChain
    );

    event RefillRequested(uint256 indexed current_balance);

    error NotBotSigner();
    error InvalidVoucher();
    error VoucherExists();
    error AlreadyClaimed();
    error InsufficientAllowance();
    error GithubIdNotSet();
    error GithubIdMismatch();
    error ClaimInProcess();
    error ApprovalFailed();

    enum ClaimStatus {
        CLAIMED,
        UNCLAIMED,
        PROCESSING
    }

    // enum Chain {
    //     ETHEREUM_SEPOLIA,
    //     BASE_SEPOLIA
    // }

    struct Voucher {
        bytes32 hash;
        uint256 contributorGithubId;
        uint256 tokenAmountIn18dec; // token amount (18-dec scale)
        ClaimStatus claimed;
    }

    // address -> github id
    mapping(address => uint256) public ownerDetails;

    // repoOwnerGithubId -> repoId -> prNumber -> Voucher
    mapping(uint256 => mapping(uint256 => mapping(uint256 => Voucher)))
        public vouchersByRepoAndPr;

    constructor(
        address tokenAddress,
        address _gasReceiver,
        address _interchainTokenService
    ) Ownable(msg.sender) {
        require(tokenAddress != address(0), "zero token");
        token = IERC20(tokenAddress);
        bot = msg.sender;
        gasService = IAxelarGasService(_gasReceiver);
        interchainTokenService = _interchainTokenService;
    }

    modifier onlyBot() {
        if (msg.sender != bot) revert NotBotSigner();
        _;
    }

    function checkUpkeep(
        bytes calldata
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        upkeepNeeded = address(this).balance < MIN_BALANCE;
        performData = "";
    }

    function performUpkeep(bytes calldata) external override {
        if (address(this).balance < MIN_BALANCE) {
            emit RefillRequested(address(this).balance);
        }
    }

    /// Owner registers GitHub id and optionally deposits tokens via transferFrom.
    function addAmount(uint256 githubId) external {
        if (githubId == 0) revert GithubIdNotSet();

        uint256 existing = ownerDetails[msg.sender];
        if (existing == 0) {
            // first time registration
            ownerDetails[msg.sender] = githubId;
        } else {
            // must match previously registered id
            if (existing != githubId) revert GithubIdMismatch();
        }

        uint256 allowance = token.allowance(msg.sender, address(this));

        if (allowance > 0) {
            // caller must approve this contract for `amount` beforehand if they want to deposit
            token.transferFrom(msg.sender, address(this), allowance);
            emit DepositAdded(msg.sender, allowance);
        }
    }

    /// Only owner can change the bot signer (safer)
    function setBotSigner(address newBot) external onlyOwner {
        bot = newBot;
    }

    function storeVoucher(
        address ownerAddress,
        uint256 ownerGithubId,
        uint256 repoGithubId,
        uint256 contributorGithubId,
        uint256 prNumber,
        uint256 tokenAmountIn18dec,
        bytes32 hash
    ) external onlyBot {
        // enforce ownerAddress is registered with the provided GitHub ID
        uint256 githubId = ownerDetails[ownerAddress];
        if (githubId == 0 || githubId != ownerGithubId) revert GithubIdNotSet();

        if (
            vouchersByRepoAndPr[ownerGithubId][repoGithubId][prNumber].hash !=
            bytes32(0)
        ) revert VoucherExists();

        require(tokenAmountIn18dec > 0, "Invalid token amount");

        vouchersByRepoAndPr[ownerGithubId][repoGithubId][prNumber] = Voucher({
            hash: hash,
            contributorGithubId: contributorGithubId,
            tokenAmountIn18dec: tokenAmountIn18dec,
            claimed: ClaimStatus.UNCLAIMED
        });

        emit VoucherStored(
            ownerAddress,
            repoGithubId,
            contributorGithubId,
            ownerGithubId,
            prNumber,
            tokenAmountIn18dec,
            hash
        );
    }

    /// Request a cross-chain claim:
    ///  - checks voucher & marks PROCESSING
    ///  - pulls platformFee from ownerAddress -> platform (owner())
    ///  - burns tokenAmount from ownerAddress (requires allowance for burnFrom)
    ///  - emits ClaimRequested for relayer to pick up
    function requestClaim(
        string calldata secret,
        address ownerAddr, // renamed to reduce stack pressure
        uint256 ownerGithubId,
        uint256 repoGithubId,
        uint256 prNumber,
        uint256 contributorGithubId,
        uint256 tokenAmountIn18dec,
        bytes calldata executableAddress,
        Helpers.Chain destinationChain
    ) external nonReentrant {
        Voucher storage v = vouchersByRepoAndPr[ownerGithubId][repoGithubId][
            prNumber
        ];

        if (v.hash == bytes32(0)) revert InvalidVoucher();

        // Recompute voucher hash exactly like off-chain
        bytes32 calculatedHash = keccak256(
            abi.encodePacked(
                secret,
                ownerAddr,
                ownerGithubId,
                repoGithubId,
                prNumber,
                contributorGithubId,
                tokenAmountIn18dec
            )
        );

        // validate & mark processing (internal helper)
        _validateVoucherAndMarkProcessing(
            v,
            calculatedHash,
            contributorGithubId,
            tokenAmountIn18dec
        );

        uint256 platformFee = (tokenAmountIn18dec * 2) / 100;

        // collect fee and burn (internal helper)
        _collectFeeAndBurn(ownerAddr, tokenAmountIn18dec, platformFee);

        if (destinationChain == Helpers.Chain.ETHEREUM_SEPOLIA) {
            bool sentOnNative = handleNativeTransfer(
                msg.sender,
                tokenAmountIn18dec
            );

            if (sentOnNative) {
                _finalizeClaim(ownerGithubId, repoGithubId, prNumber, msg.sender, tokenAmountIn18dec, destinationChain);
            }
        } else {
            // Build non-empty payload required by ITS executable on destination chain
            // Encodes minimal data for the destination contract to handle the claim
            bytes memory payload = abi.encode(
                ownerGithubId,
                repoGithubId,
                prNumber,
                msg.sender, // claimer/recipient on destination chain
                tokenAmountIn18dec
            );

            uint256 gasFees = estimateGasFee(
                Helpers.chainToAxelarName(destinationChain),
                Helpers.bytesToStringAddress(executableAddress),
                payload
            );
            // bytes32 tokenId = bytes32(0);
            // IInterchainTokenService(interchainTokenService).callContractWithInterchainToken{value: gasFees}(
            //     tokenId,
            //     Helpers.chainToAxelarName(destinationChain),
            //     executableAddress,        // base sepolia contract address (which will be executed by axelar)
            //     tokenAmountIn18dec,
            //     new bytes(0)
            // );
            IInterchainTokenService(interchainTokenService).callContractWithInterchainToken{value: gasFees}(
                0x5b28793d6ddc2d161f8c7078933758d730076e5d43522d2d10b3bd2f28e9832b,
                Helpers.chainToAxelarName(destinationChain),
                executableAddress, // destination chain executable contract address
                tokenAmountIn18dec,
                payload
            );
        }

        emit ClaimRequested(
            v.hash,
            repoGithubId,
            prNumber,
            msg.sender,
            ownerAddr,
            ownerGithubId,
            tokenAmountIn18dec,
            platformFee,
            destinationChain
        );
    }

    /// Internal: validate voucher details and mark it PROCESSING
    function _validateVoucherAndMarkProcessing(
        Voucher storage v,
        bytes32 calculatedHash,
        uint256 contributorGithubId,
        uint256 tokenAmountIn18dec
    ) internal {
        if (
            v.hash != calculatedHash ||
            v.contributorGithubId != contributorGithubId ||
            v.tokenAmountIn18dec != tokenAmountIn18dec
        ) revert InvalidVoucher();

        if (v.claimed == ClaimStatus.PROCESSING) revert ClaimInProcess();
        if (v.claimed == ClaimStatus.CLAIMED) revert AlreadyClaimed();

        // mark processing before external calls
        v.claimed = ClaimStatus.PROCESSING;
    }

    /// Internal: check allowance, transfer platform fee, burn tokens from ownerAddr
    function _collectFeeAndBurn(
        address ownerAddr,
        uint256 tokenAmountIn18dec,
        uint256 platformFee
    ) internal {
        uint256 required = tokenAmountIn18dec + platformFee;
        if (token.allowance(ownerAddr, address(this)) < required)
            revert InsufficientAllowance();

        // pull fee to platform owner
        bool approved = token.approve(owner(), platformFee);

        if (!approved) {
            revert ApprovalFailed();
        }
        token.transferFrom(ownerAddr, owner(), platformFee);
    }

    function estimateGasFee(
        string memory destinationChain,
        string memory destinationAddress,
        bytes memory payload
    ) internal view returns (uint256) {
        return
            gasService.estimateGasFee(
                destinationChain,
                destinationAddress,
                payload,
                GAS_LIMIT,
                new bytes(0)
            );
    }

    function handleNativeTransfer(
        address to,
        uint256 amount
    ) internal returns (bool sent) {
        bool approved = token.approve(to, amount);
        require(approved, "Approval Denied");

        sent = token.transferFrom(address(this), to, amount);
    }

    function finalizeClaim(
        uint256 ownerGithubId,
        uint256 repoGithubId,
        uint256 prNumber,
        address claimer,
        uint256 tokenAmountIn18dec,
        Helpers.Chain destinationChain
    ) external onlyBot {
        _finalizeClaim(
            ownerGithubId,
            repoGithubId,
            prNumber,
            claimer,
            tokenAmountIn18dec,
            destinationChain
        );
    }

    /// Called by your relayer (bot) AFTER it has confirmed successful mint on the destination chain.
    /// relayer should verify off-chain; on-chain we just restrict to bot signer and voucher status.
    function _finalizeClaim(
        uint256 ownerGithubId,
        uint256 repoGithubId,
        uint256 prNumber,
        address claimer,
        uint256 tokenAmountIn18dec,
        Helpers.Chain destinationChain
    ) internal  {
        Voucher storage v = vouchersByRepoAndPr[ownerGithubId][repoGithubId][
            prNumber
        ];

        if (v.hash == bytes32(0)) revert InvalidVoucher();
        if (v.claimed != ClaimStatus.PROCESSING) revert ClaimInProcess();

        // mark claimed
        v.claimed = ClaimStatus.CLAIMED;

        emit ClaimFinalized(
            v.hash,
            repoGithubId,
            prNumber,
            claimer,
            tokenAmountIn18dec,
            destinationChain
        );
    }

    /// view helpers
    function getOwnerDetails(
        address ownerAddress
    ) external view returns (uint256) {
        return ownerDetails[ownerAddress];
    }

    function getVoucherDetails(
        uint256 repoOwnerGithubId,
        uint256 repoId,
        uint256 prNumber
    ) external view returns (Voucher memory) {
        return vouchersByRepoAndPr[repoOwnerGithubId][repoId][prNumber];
    }

    function getCurrentSigner() external view returns (address) {
        return bot;
    }

    // receive/fallback kept for compatibility
    fallback() external payable {}
    receive() external payable {}
}
