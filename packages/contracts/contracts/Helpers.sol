// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/// @notice Small helper library for Axelar-style conversions (enum -> chain name, bytes -> address/string, address -> hex)
import "@openzeppelin/contracts/utils/Strings.sol";

library Helpers {
    using Strings for uint256;

    enum Chain {
        ETHEREUM_SEPOLIA,
        BASE_SEPOLIA
    }

    /// @notice Map your enum Chain to the string Axelar expects.
    /// @dev Tweak returned names to match exact Axelar/Sdk expectations (mainnet vs testnet).
    function chainToAxelarName(Chain c) internal pure returns (string memory) {
        if (c == Chain.ETHEREUM_SEPOLIA) {
            return "ethereum-sepolia";
        } else if (c == Chain.BASE_SEPOLIA) {
            return "base-sepolia";
        } else {
            revert("AxelarHelpers: unsupported chain");
        }
    }

    /// @notice Convert a bytes blob into a string suitable for Axelar destinationAddress param.
    /// @dev If `b` is exactly 20 bytes, treat as raw address -> produce 0x-prefixed hex string.
    ///      Otherwise treat it as ascii textual address and return string(b).
    function bytesToStringAddress(
        bytes memory b
    ) internal pure returns (string memory) {
        if (b.length == 20) {
            address a = bytesToAddress(b);
            return addressToHexString(a);
        } else {
            // assume bytes contain an ASCII string representation already
            return string(b);
        }
    }

    /// @notice Convert exactly 20-byte `bytes` into `address`.
    function bytesToAddress(
        bytes memory b
    ) internal pure returns (address addr) {
        require(b.length == 20, "AxelarHelpers: invalid address length");
        assembly {
            // load 32 bytes from `b` (offset 32), then mask to 20 bytes
            addr := mload(add(b, 20))
        }
    }

    /// @notice Convert an address into 0x-prefixed hex string (20 byte length)
    function addressToHexString(
        address _addr
    ) internal pure returns (string memory) {
        return Strings.toHexString(uint256(uint160(_addr)), 20);
    }
}
