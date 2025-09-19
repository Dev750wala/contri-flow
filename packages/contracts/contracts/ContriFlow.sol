// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IERC20Burnable is IERC20 {
    function burnFrom(address account, uint256 amount) external;
}

contract ContriFlow is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20Burnable public immutable token;
    address private bot;

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
        string destinationChain
    );

    event ClaimFinalized(
        bytes32 indexed voucherHash,
        uint256 indexed repoGithubId,
        uint256 indexed prNumber,
        address claimant,
        uint256 tokenAmount,
        string destinationChain,
        bytes relayerMetadata
    );

    error NotBotSigner();
    error InvalidVoucher();
    error VoucherExists();
    error AlreadyClaimed();
    error InsufficientAllowance();
    error GithubIdNotSet();
    error GithubIdMismatch();
    error ClaimInProcess();

    enum ClaimStatus {
        CLAIMED,
        UNCLAIMED,
        PROCESSING
    }

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

    constructor(address tokenAddress) Ownable(msg.sender) {
        require(tokenAddress != address(0), "zero token");
        token = IERC20Burnable(tokenAddress);
        bot = msg.sender; // initial bot = deployer; changeable by owner
    }

    modifier onlyBot() {
        if (msg.sender != bot) revert NotBotSigner();
        _;
    }

    /// Owner registers GitHub id and optionally deposits tokens via transferFrom.
    function addAmount(uint256 githubId, uint256 amount) external {
        if (githubId == 0) revert GithubIdNotSet();

        uint256 existing = ownerDetails[msg.sender];
        if (existing == 0) {
            // first time registration
            ownerDetails[msg.sender] = githubId;
        } else {
            // must match previously registered id
            if (existing != githubId) revert GithubIdMismatch();
        }

        if (amount > 0) {
            // caller must approve this contract for `amount` beforehand if they want to deposit
            IERC20(address(token)).safeTransferFrom(msg.sender, address(this), amount);
            emit DepositAdded(msg.sender, amount);
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

        if (vouchersByRepoAndPr[ownerGithubId][repoGithubId][prNumber].hash != bytes32(0))
            revert VoucherExists();

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
        string calldata destinationChain
    ) external nonReentrant {
        Voucher storage v = vouchersByRepoAndPr[ownerGithubId][repoGithubId][prNumber];

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
        _validateVoucherAndMarkProcessing(v, calculatedHash, contributorGithubId, tokenAmountIn18dec);

        uint256 platformFee = (tokenAmountIn18dec * 2) / 100;

        // collect fee and burn (internal helper)
        _collectFeeAndBurn(ownerAddr, tokenAmountIn18dec, platformFee);

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
        if (token.allowance(ownerAddr, address(this)) < required) revert InsufficientAllowance();

        // pull fee to platform owner
        IERC20(address(token)).safeTransferFrom(ownerAddr, owner(), platformFee);

        // burn requested tokens from owner (reduces totalSupply)
        token.burnFrom(ownerAddr, tokenAmountIn18dec);
    }

    /// Called by your relayer (bot) AFTER it has confirmed successful mint on the destination chain.
    /// relayer should verify off-chain; on-chain we just restrict to bot signer and voucher status.
    function finalizeClaim(
        uint256 ownerGithubId,
        uint256 repoGithubId,
        uint256 prNumber,
        address claimer,
        uint256 tokenAmountIn18dec,
        string calldata destinationChain,
        bytes calldata relayerMetadata
    ) external onlyBot {
        Voucher storage v = vouchersByRepoAndPr[ownerGithubId][repoGithubId][prNumber];

        if (v.hash == bytes32(0)) revert InvalidVoucher();
        if (v.claimed != ClaimStatus.PROCESSING) revert ClaimInProcess();

        // mark claimed
        v.claimed = ClaimStatus.CLAIMED;

        emit ClaimFinalized(v.hash, repoGithubId, prNumber, claimer, tokenAmountIn18dec, destinationChain, relayerMetadata);
    }

    /// view helpers
    function getOwnerDetails(address ownerAddress) external view returns (uint256) {
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
