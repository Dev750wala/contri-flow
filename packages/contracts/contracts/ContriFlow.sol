// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ContriFlow is ReentrancyGuard, Ownable {
    IERC20 public token;

    event DepositAdded(address indexed ownerAddress, uint256 amountWei);
    event DepositRemoved(address indexed ownerAddress, uint256 amountWei);
    event VoucherStored(
        address indexed ownerAddress,
        uint256 indexed repoGithubId,
        uint256 indexed contributorGithubId,
        uint256 ownerGithubId,
        uint256 prNumber,
        uint256 dollarAmount8dec,
        bytes32 hash
    );

    event RewardClaimed(
        address indexed ownerAddress,
        uint256 indexed repoGithubId,
        uint256 indexed contrubutorGithubId,
        uint256 ownerGithubId,
        uint256 prNumber,
        address contributor,
        uint256 amountWei,
        uint256 dollarAmount8dec
    );

    error NotOwner();
    error InvalidBotSigner();
    error InvalidPriceFeed();
    error InvalidVoucher();
    error VoucherExists();
    error AlreadyClaimed();
    error InsufficientBalance();
    error TransferFailed();
    error NotBotSigner();
    error GithubIdNotSet();
    error GithubIdMismatch();

    enum ClaimStatus {
        CLAIMED,
        UNCLAIMED,
        IN_PROGRESS
    }

    struct RepoOwnerDetails {
        uint256 githubId;
        uint256 amount;
    }

    struct Voucher {
        bytes32 hash;
        uint256 contributorGithubId;
        uint256 tokenAmountIn18dec; // Token amount scaled to 18 decimals (e.g. 1 DEV => 1 * 1e18)
        ClaimStatus claimed;
    }

    mapping(address => RepoOwnerDetails) public ownerDetails;

    address private bot;

    modifier onlyBot() {
        require(msg.sender == bot, "Not owner");
        _;
    }

    // mapping (uint256 repoOwnerGithubId => mapping (uint256 repoId => mapping(uint256 prNumber =>  Voucher)) vouchersByRepoAndPr;
    mapping(uint256 => mapping(uint256 => mapping(uint256 => Voucher)))
        public vouchersByRepoAndPr;

    // repoOwnerGithubId -> repoId -> prNumber -> Voucher

    constructor(address tokenAddress) Ownable(msg.sender) {
        token = IERC20(tokenAddress);
        bot = msg.sender;
    }

    function setBotSigner(address newBot) external onlyBot {
        bot = newBot;
    }

    /// @notice Owner deposits tokens to the contract
    function addAmount(uint256 githubId, uint256 amount) external {
        token.transferFrom(msg.sender, address(this), amount);
        if (githubId == 0) revert GithubIdNotSet();

        RepoOwnerDetails storage details = ownerDetails[msg.sender];

        if (details.githubId == 0) {
            details.githubId = githubId;
        } else if (details.githubId != githubId) revert GithubIdMismatch();

        details.amount += amount;
        emit DepositAdded(msg.sender, amount);
    }

    /// @notice Owner withdraws unused tokens from a deposit
    // function removeAmount(uint256 amountWei) external {
    //     uint256 bal = ownerDetails[msg.sender].amount;
    //     if (bal < amountWei) revert InsufficientBalance();
    //     ownerDetails[msg.sender].amount -= amountWei;
    //     (bool success, ) = payable(msg.sender).call{value: amountWei}("");
    //     if (!success) revert TransferFailed();
    //     emit DepositRemoved(msg.sender, amountWei);
    // }

    function storeVoucher(
        address ownerAddress,
        uint256 ownerGithubId,
        uint256 repoGithubId,
        uint256 contributorGithubId,
        uint256 prNumber,
        uint256 tokenAmountIn18dec,
        bytes32 hash
    ) external onlyBot {
        // Check GitHub ID was set on-chain for ownerAddress
        uint256 recorded = ownerDetails[ownerAddress].githubId;
        if (recorded == 0 || recorded != ownerGithubId) revert GithubIdNotSet();

        if (vouchersByRepoAndPr[ownerGithubId][repoGithubId][prNumber].hash != bytes32(0)) revert VoucherExists();

        require(tokenAmountIn18dec > 0, "Invalid token amount");

        // Store voucher
        vouchersByRepoAndPr[ownerGithubId][repoGithubId][prNumber] = Voucher({
            hash: hash,
            contributorGithubId: contributorGithubId,
            tokenAmountIn18dec: tokenAmountIn18dec,
            claimed: false
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

    function requestClaim(
        string calldata secret,
        address ownerAddress,
        uint256 ownerGithubId,
        uint256 repoGithubId,
        uint256 prNumber,
        uint256 contributorGithubId,
        uint256 tokenAmountIn18dec,
        string calldata destinationChain
    ) external nonReentrant {
        address contributor = msg.sender;

        Voucher storage v = vouchersByRepoAndPr[ownerGithubId][repoGithubId][prNumber];

        if(v.hash == bytes32(0)) { revert InvalidVoucher(); }
        
        // Recompute voucherId as was done off-chain
        bytes32 calculatedHash = keccak256(
            abi.encodePacked(
                secret,
                ownerAddress,
                ownerGithubId,
                repoGithubId,
                prNumber,
                contributorGithubId,
                tokenAmountIn18dec
            )
        );

        if (
            v.hash != calculatedHash ||
            v.contributorGithubId != contributorGithubId ||
            v.tokenAmountIn18dec != tokenAmountIn18dec
        ) {
            revert InvalidVoucher();
        }
        if (v.claimed) revert AlreadyClaimed();

        // Mark claimed
        v.claimed = true;
        uint256 ethAmt = v.ethAmountInWei;

        // Deduct from owner's deposit for this repo
        uint256 bal = ownerDetails[ownerAddress].amount;
        if (bal < ethAmt) revert InsufficientBalance();
        ownerDetails[ownerAddress].amount = bal - ethAmt;

        // Transfer ETH to contributor
        (bool sent, ) = payable(contributor).call{value: ethAmt}("");
        if (!sent) revert TransferFailed();

        emit RewardClaimed(
            ownerAddress,
            repoGithubId,
            contributorGithubId,
            ownerGithubId,
            prNumber,
            contributor,
            ethAmt,
            dollarAmount8dec
        );
    }

    function getOwnerDetails(address ownerAddress) view external returns (RepoOwnerDetails memory) {
        return ownerDetails[ownerAddress];
    }
    
    function getVoucherDetails(uint256 repoOwnerGithubId, uint256 repoId, uint256 prNumber) external view  returns (Voucher memory) {
        return vouchersByRepoAndPr[repoOwnerGithubId][repoId][prNumber];
    }

    function getCurrentSigner() external view returns (address) {
        return bot;
    } 

    fallback() external payable {}

    receive() external payable {}
}
