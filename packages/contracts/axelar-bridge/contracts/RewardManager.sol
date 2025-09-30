// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";
import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executables/AxelarExecutable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RewardManager
 * @notice Distributes cross-chain rewards using Axelar callContractWithToken.
 */
contract RewardManager is AxelarExecutable, ReentrancyGuard, Ownable {
    error InvalidAddress();

    IAxelarGasService public immutable gasService;
    address public rewardToken; // ERC20 on current chain used for rewards

    event FundDeposited(address indexed from, uint256 amount);
    event RewardDispatched(string destinationChain, string destinationAddress, uint256 amount, bytes payload);

    constructor(address gateway_, address gasService_, address initialOwner_, address rewardToken_) AxelarExecutable(gateway_) {
        if (gasService_ == address(0) || initialOwner_ == address(0) || rewardToken_ == address(0)) revert InvalidAddress();
        gasService = IAxelarGasService(gasService_);
        rewardToken = rewardToken_;
        _transferOwnership(initialOwner_);
    }

    function setRewardToken(address newToken) external onlyOwner {
        if (newToken == address(0)) revert InvalidAddress();
        rewardToken = newToken;
    }

    function depositToFund(uint256 amount) external nonReentrant {
        require(amount > 0, "InvalidAmount");
        IERC20(rewardToken).transferFrom(msg.sender, address(this), amount);
        emit FundDeposited(msg.sender, amount);
    }

    // payload can encode business logic (e.g., reward type)
    function distributeRewardCrossChain(
        string calldata destinationChain,
        string calldata destinationAddress,
        uint256 amount,
        bytes calldata payload
    ) external payable onlyOwner nonReentrant {
        require(amount > 0, "InvalidAmount");

        // Approve gateway to transfer tokens
        IERC20(rewardToken).approve(address(gateway), amount);

        // Pay gas in native token via gas service
        if (msg.value > 0) {
            gasService.payNativeGasForContractCallWithToken{value: msg.value}(
                address(this),
                destinationChain,
                destinationAddress,
                payload,
                "" ,
                rewardToken,
                amount,
                msg.sender
            );
        }

        gateway.callContractWithToken(
            destinationChain,
            destinationAddress,
            payload,
            rewardToken,
            amount
        );

        emit RewardDispatched(destinationChain, destinationAddress, amount, payload);
    }

    // Handle incoming executions if needed
    function _execute(
        string calldata /*sourceChain*/, 
        string calldata /*sourceAddress*/, 
        bytes calldata /*payload*/
    ) internal override {}
}


