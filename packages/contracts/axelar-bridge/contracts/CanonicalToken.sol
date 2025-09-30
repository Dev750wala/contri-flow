// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/**
 * @title CanonicalToken
 * @notice Canonical ERC20 on source chain (Ethereum Sepolia). Supply is the global source of truth.
 * Gateway can lock/unlock for bridging. Owner controls minting for distribution.
 */
contract CanonicalToken is Initializable, ERC20Upgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable, UUPSUpgradeable {
    error OnlyGateway();
    error InvalidGateway();
    error InvalidAddress();

    event GatewayUpdated(address indexed previousGateway, address indexed newGateway);
    event TokensLocked(address indexed from, uint256 amount);
    event TokensUnlocked(address indexed to, uint256 amount);

    address public gateway;

    modifier onlyGateway() {
        if (msg.sender != gateway) revert OnlyGateway();
        _;
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        address initialOwner_,
        address gateway_
    ) external initializer {
        if (initialOwner_ == address(0)) revert InvalidAddress();
        if (gateway_ == address(0)) revert InvalidGateway();

        __ERC20_init(name_, symbol_);
        __Ownable_init(initialOwner_);
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        gateway = gateway_;
        emit GatewayUpdated(address(0), gateway_);
    }

    function setGateway(address newGateway) external onlyOwner {
        if (newGateway == address(0)) revert InvalidGateway();
        address previous = gateway;
        gateway = newGateway;
        emit GatewayUpdated(previous, newGateway);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // Owner mint for initial distributions/liquidity
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Bridge functions (Lock & Unlock)
    function bridgeLock(uint256 amount) external onlyGateway nonReentrant whenNotPaused {
        _transfer(msg.sender, address(this), amount);
        emit TokensLocked(msg.sender, amount);
    }

    function bridgeUnlock(address to, uint256 amount) external onlyGateway nonReentrant whenNotPaused {
        if (to == address(0)) revert InvalidAddress();
        _transfer(address(this), to, amount);
        emit TokensUnlocked(to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}


