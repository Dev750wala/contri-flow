// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";
import {IInterchainTokenService} from "@axelar-network/interchain-token-service/contracts/interfaces/IInterchainTokenService.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {AddressBytes} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/libs/AddressBytes.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./Helpers.sol";

contract ContriFlow is ReentrancyGuard, Ownable, AutomationCompatibleInterface {
    using Strings for uint256;

    using Helpers for *;
    using AddressBytes for *;
    using EnumerableSet for EnumerableSet.AddressSet;

    IERC20 public immutable token;
    address private bot;
    uint256 public constant MIN_BALANCE = 0.1 ether;
    uint256 public constant GAS_LIMIT = 200000;
    IAxelarGasService public immutable gasService;
    address immutable interchainTokenService;

    event DepositAdded(address indexed orgAddress, uint256 amountWei);
    event DepositRemoved(address indexed orgAddress, uint256 amountWei);

    event VoucherStored(
        uint32 indexed repoGithubId,
        uint64 indexed contributorGithubId,
        uint64 orgGithubId,
        uint32 prNumber,
        uint256 tokenAmountIn18dec,
        bytes32 hash
    );

    event ClaimRequested(
        bytes32 indexed voucherHash,
        uint32 indexed repoGithubId,
        uint32 indexed prNumber,
        address requester,
        uint64 orgGithubId,
        uint256 tokenAmount,
        uint256 platformFee,
        Helpers.Chain destinationChain
    );

    event ClaimFinalized(
        bytes32 indexed voucherHash,
        uint32 indexed repoGithubId,
        uint32 indexed prNumber,
        address claimant,
        uint256 tokenAmount,
        Helpers.Chain destinationChain
    );

    event RefillRequested(uint256 indexed current_balance);

    error NotBotSigner();
    error InvalidVoucher();
    error VoucherExists();
    error AlreadyClaimed();
    error InsufficientBalanceInContract();
    error GithubIdNotSet();
    error GithubIdMismatch();
    error ClaimInProcess();
    error ApprovalFailed();
    error NoGithubOrganizationFoundToFund();
    error NotEnoughFundsForOrganization();

    enum ClaimStatus {
        CLAIMED,
        UNCLAIMED
    }

    // enum Chain {
    //     ETHEREUM_SEPOLIA,
    //     BASE_SEPOLIA
    // }

    struct Voucher {
        bytes32 hash;
        uint64 contributorGithubId;
        uint256 tokenAmountIn18dec; // token amount (18-dec scale)
        ClaimStatus claimed;
    }

    struct ClaimRequest {
        string secret;
        uint64 orgGithubId;
        uint32 repoGithubId;
        uint32 prNumber;
        uint64 contributorGithubId;
        uint256 tokenAmountIn18dec;
        address executableAddress;
        Helpers.Chain destinationChain;
    }

    // organization github id -> token amount
    mapping(uint64 => uint256) public fundForOrganization;
    mapping(uint64 => EnumerableSet.AddressSet) private addressesByGithubId;

    // orgGithubId -> repoId -> prNumber -> Voucher
    mapping(uint64 => mapping(uint32 => mapping(uint32 => Voucher)))
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
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        uint256 bal = address(this).balance;
        upkeepNeeded = bal < MIN_BALANCE;
        if (upkeepNeeded) {
            performData = abi.encode(bal);
        } else {
            performData = "";
        }
    }

    function performUpkeep(bytes calldata) external override {
        if (address(this).balance < MIN_BALANCE) {
            emit RefillRequested(address(this).balance);
        }
    }

    /// Organization registers GitHub id and optionally deposits tokens via transferFrom.
    function addAmount(uint64 orgGithubId) external {
        if (orgGithubId == 0) revert GithubIdNotSet();

        uint256 allowance = token.allowance(msg.sender, address(this));

        if (allowance > 0) {
            addressesByGithubId[orgGithubId].add(msg.sender);
            // caller must approve this contract for `amount` beforehand if they want to deposit
            fundForOrganization[orgGithubId] += allowance;
            token.transferFrom(msg.sender, address(this), allowance);
            emit DepositAdded(msg.sender, allowance);
        }
    }

    /// Only owner can change the bot signer (safer)
    function setBotSigner(address newBot) external onlyOwner {
        bot = newBot;
    }

    function storeVoucher(
        uint64 orgGithubId,
        uint32 repoGithubId,
        uint64 contributorGithubId,
        uint32 prNumber,
        uint256 tokenAmountIn18dec,
        bytes32 hash
    ) external onlyBot {
        // // enforce ownerAddress is registered with the provided GitHub ID
        // uint256 githubId = githubOfAddress[ownerAddress];
        // if (githubId == 0 || githubId != ownerGithubId) revert GithubIdNotSet();

        if (
            vouchersByRepoAndPr[orgGithubId][repoGithubId][prNumber].hash !=
            bytes32(0)
        ) revert VoucherExists();

        if (addressesByGithubId[orgGithubId].length() == 0) {
            revert NoGithubOrganizationFoundToFund();
        }

        if (fundForOrganization[orgGithubId] < tokenAmountIn18dec) {
            revert NotEnoughFundsForOrganization();
        }

        require(tokenAmountIn18dec > 0, "Invalid token amount");

        vouchersByRepoAndPr[orgGithubId][repoGithubId][prNumber] = Voucher({
            hash: hash,
            contributorGithubId: contributorGithubId,
            tokenAmountIn18dec: tokenAmountIn18dec,
            claimed: ClaimStatus.UNCLAIMED
        });

        emit VoucherStored(
            repoGithubId,
            contributorGithubId,
            orgGithubId,
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
    function requestClaim(ClaimRequest calldata request) external nonReentrant {
        Voucher storage v = vouchersByRepoAndPr[request.orgGithubId][
            request.repoGithubId
        ][request.prNumber];

        if (v.hash == bytes32(0)) revert InvalidVoucher();

        bytes32 calculatedHash = keccak256(
            abi.encodePacked(
                request.secret,
                request.orgGithubId,
                request.repoGithubId,
                request.prNumber,
                request.contributorGithubId,
                request.tokenAmountIn18dec
            )
        );

        _validateVoucherAndMarkProcessing(
            v,
            calculatedHash,
            request.contributorGithubId,
            request.tokenAmountIn18dec
        );

        uint256 platformFee = (request.tokenAmountIn18dec * 2) / 100;
        _collectFeeAndBurn(
            request.tokenAmountIn18dec,
            platformFee,
            request.orgGithubId
        );

        if (request.destinationChain == Helpers.Chain.ETHEREUM_SEPOLIA) {
            bool sentOnNative = handleNativeTransfer(
                msg.sender,
                request.tokenAmountIn18dec
            );
            if (sentOnNative) {
                _finalizeClaim(
                    request.orgGithubId,
                    request.repoGithubId,
                    request.prNumber,
                    msg.sender,
                    request.tokenAmountIn18dec,
                    request.destinationChain
                );
                v.claimed = ClaimStatus.CLAIMED;
            }
        } else {
            _handleCrossChainClaim(request, v);
        }

        emit ClaimRequested(
            v.hash,
            request.repoGithubId,
            request.prNumber,
            msg.sender,
            request.orgGithubId,
            request.tokenAmountIn18dec,
            platformFee,
            request.destinationChain
        );
    }

    function _handleCrossChainClaim(
        ClaimRequest calldata request,
        Voucher storage v
    ) internal {
        bytes memory payload = bytes.concat(
            bytes4(0),
            abi.encode(
                request.orgGithubId,
                request.repoGithubId,
                request.prNumber,
                msg.sender,
                request.tokenAmountIn18dec
            )
        );

        bytes memory bytesDestinationAddress = AddressBytes.toBytes(
            request.executableAddress
        );

        uint256 gasFees = estimateGasFee(
            Helpers.chainToAxelarName(request.destinationChain),
            request.executableAddress,
            payload
        );

        require(address(this).balance >= gasFees, "Insufficient gas fees sent");

        v.claimed = ClaimStatus.CLAIMED;

        IInterchainTokenService(interchainTokenService)
            .callContractWithInterchainToken{value: gasFees}(
            0x5b28793d6ddc2d161f8c7078933758d730076e5d43522d2d10b3bd2f28e9832b,
            Helpers.chainToAxelarName(request.destinationChain),
            bytesDestinationAddress,
            request.tokenAmountIn18dec,
            payload
        );
    }

    /// Internal: validate voucher details and mark it PROCESSING
    function _validateVoucherAndMarkProcessing(
        Voucher storage v,
        bytes32 calculatedHash,
        uint256 contributorGithubId,
        uint256 tokenAmountIn18dec
    ) internal view {
        if (
            v.hash != calculatedHash ||
            v.contributorGithubId != contributorGithubId ||
            v.tokenAmountIn18dec != tokenAmountIn18dec
        ) revert InvalidVoucher();

        if (v.claimed == ClaimStatus.CLAIMED) revert AlreadyClaimed();
    }

    function _collectFeeAndBurn(
        uint256 tokenAmountIn18dec,
        uint256 platformFee,
        uint64 orgGithubId
    ) internal {
        uint256 required = tokenAmountIn18dec + platformFee;
        if (token.balanceOf(address(this)) < required)
            revert InsufficientBalanceInContract();

        // pull fee to platform owner
        // bool approved = token.approve(owner(), platformFee);
        if (fundForOrganization[orgGithubId] < required) {
            revert NotEnoughFundsForOrganization();
        }

        // if (!approved) {
        //     revert ApprovalFailed();
        // }
        fundForOrganization[orgGithubId] -= required;
        token.transfer(owner(), platformFee);
    }

    function estimateGasFee(
        string memory destinationChain,
        address destinationAddress,
        bytes memory payload
    ) internal view returns (uint256) {
        return
            gasService.estimateGasFee(
                destinationChain,
                Helpers.addressToHexString(destinationAddress),
                payload,
                GAS_LIMIT,
                new bytes(0)
            );
    }

    function handleNativeTransfer(
        address to,
        uint256 amount
    ) internal returns (bool sent) {
        sent = token.transfer(to, amount);
    }

    function finalizeClaim(
        uint64 orgGithubId,
        uint32 repoGithubId,
        uint32 prNumber,
        address claimer,
        uint256 tokenAmountIn18dec,
        Helpers.Chain destinationChain
    ) external onlyBot {
        _finalizeClaim(
            orgGithubId,
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
        uint64 orgGithubId,
        uint32 repoGithubId,
        uint32 prNumber,
        address claimer,
        uint256 tokenAmountIn18dec,
        Helpers.Chain destinationChain
    ) internal {
        Voucher storage v = vouchersByRepoAndPr[orgGithubId][repoGithubId][
            prNumber
        ];

        if (v.hash == bytes32(0)) revert InvalidVoucher();

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

    function emergencyWithdrawTokens(
        address _token,
        uint256 _amount
    ) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }

    function emergencyWithdrawEth() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}(
            ""
        );
        require(success, "Transfer failed");
    }

    /// view helpers
    // function getOwnerDetails(
    //     address ownerAddress
    // ) external view returns (uint256) {
    //     return githubOfAddress[ownerAddress];
    // }

    function getVoucherDetails(
        uint64 orgGithubId,
        uint32 repoId,
        uint32 prNumber
    ) external view returns (Voucher memory) {
        return vouchersByRepoAndPr[orgGithubId][repoId][prNumber];
    }

    function getCurrentSigner() external view returns (address) {
        return bot;
    }

    // receive/fallback kept for compatibility
    fallback() external payable {}
    receive() external payable {}
}
