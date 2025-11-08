// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ContriFlow is ReentrancyGuard, Ownable {
    using Strings for uint256;

    using EnumerableSet for EnumerableSet.AddressSet;

    IERC20 public immutable token;

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
    
    event ClaimReleased(
        ds
    );

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
    error failedToTransferTokens();

    enum ClaimStatus {
        CLAIMED,
        UNCLAIMED
    }

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
        address contributorAddress;
        uint256 tokenAmountIn18dec;
    }

    // organization github id -> token amount
    mapping(uint64 => uint256) public fundForOrganization;
    // organization github ID -> addresses of those who funded organization
    mapping(uint64 => EnumerableSet.AddressSet) private addressesByGithubId;

    // orgGithubId -> repoId -> prNumber -> Voucher
    mapping(uint64 => mapping(uint32 => mapping(uint32 => Voucher)))
        public vouchersByRepoAndPr;

    constructor(address tokenAddress) Ownable(msg.sender) {
        require(tokenAddress != address(0), "zero token");
        token = IERC20(tokenAddress);
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

    function storeVoucher(
        uint64 orgGithubId,
        uint32 repoGithubId,
        uint64 contributorGithubId,
        uint32 prNumber,
        uint256 tokenAmountIn18dec,
        bytes32 hash
    ) external onlyOwner {
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

        bool sent = token.transfer(request.contributorAddress, request.tokenAmountIn18dec);
        
        if (!sent) revert failedToTransferTokens();
        v.claimed = ClaimStatus.CLAIMED;
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
    function getVoucherDetails(
        uint64 orgGithubId,
        uint32 repoId,
        uint32 prNumber
    ) external view returns (Voucher memory) {
        return vouchersByRepoAndPr[orgGithubId][repoId][prNumber];
    }

    // receive/fallback kept for compatibility
    fallback() external payable {}
    receive() external payable {}
}
