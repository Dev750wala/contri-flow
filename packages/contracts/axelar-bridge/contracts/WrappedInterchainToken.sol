// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/**
 * @title WrappedInterchainToken
 * @notice Wrapped token on destination chain, mint/burn controlled by gateway.
 * Supports UUPS proxies and emergency pause. Includes manual mint for recovery with owner-only access.
 */
contract WrappedInterchainToken is Initializable, ERC20Upgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable, UUPSUpgradeable {
    // ============ Errors ============
    error OnlyGateway();
    error InvalidGateway();
    error InvalidAddress();

    // ============ Events ============
    event GatewayUpdated(address indexed previousGateway, address indexed newGateway);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    // ============ Storage ============
    address public gateway;

    // Optional simple rate limiter: maximum manual mint per 24h
    uint256 public maxManualMintPerDay;
    uint256 public manualMintedToday;
    uint256 public manualMintDayStart;

    // ============ Modifiers ============
    modifier onlyGateway() {
        if (msg.sender != gateway) revert OnlyGateway();
        _;
    }

    // ============ Initializer ============
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

        maxManualMintPerDay = 0; // disabled by default
        manualMintDayStart = block.timestamp;
    }

    // ============ Admin ============
    function setGateway(address newGateway) external onlyOwner {
        if (newGateway == address(0)) revert InvalidGateway();
        address previous = gateway;
        gateway = newGateway;
        emit GatewayUpdated(previous, newGateway);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Configure daily manual mint cap (0 disables manual mint)
    function setMaxManualMintPerDay(uint256 newCap) external onlyOwner {
        maxManualMintPerDay = newCap;
        if (manualMintDayStart + 1 days <= block.timestamp) {
            manualMintDayStart = block.timestamp;
            manualMintedToday = 0;
        }
    }

    // ============ Gateway mint/burn ============
    function mintByGateway(address to, uint256 amount) external onlyGateway nonReentrant whenNotPaused {
        if (to == address(0)) revert InvalidAddress();
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    function burnByGateway(uint256 amount) external onlyGateway nonReentrant whenNotPaused {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    // ============ Recovery ============
    function manualMint(address to, uint256 amount) external onlyOwner nonReentrant whenNotPaused {
        // Rate limiting
        if (maxManualMintPerDay == 0) revert("ManualMintDisabled");
        if (block.timestamp >= manualMintDayStart + 1 days) {
            manualMintDayStart = block.timestamp;
            manualMintedToday = 0;
        }
        require(manualMintedToday + amount <= maxManualMintPerDay, "ManualMintCapExceeded");
        if (to == address(0)) revert InvalidAddress();
        manualMintedToday += amount;
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    // ============ Hooks ============
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    // ============ UUPS Auth ============
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}


