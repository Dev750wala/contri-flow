// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        // Chainlink returns price with 8 decimals, convert to 18 decimals (wei)
        return uint256(answer) * 1e10;
    }

    /// @notice Converts USD amount (8 decimals) to ETH amount (in wei)
    /// @param usdAmount The amount in USD (e.g., $50 = 50 * 1e8)
    function getEthAmountFromUsd(
        uint256 usdAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed); // ETH price in USD, 18 decimals
        // USD has 8 decimals, so multiply by 1e18 to get wei, then divide by price
        return (usdAmount * 1e18) / ethPrice;
    }
}
