//SPDX-License-Identifier: MIT

pragma solidity ^0.8.30;

interface IAggregatorV3 {
    // minimal Chainlink interface used here
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    function decimals() external view returns (uint8);
}


contract ChainlinkPrice{

    IAggregatorV3 public priceFeed;

    // Pass the Chainlink feed address in the constructor
    // e.g. BNB/USD, ETH/USD, BTC/USD, etc.
    constructor(address _priceFeed) {
        priceFeed = IAggregatorV3(_priceFeed);
    }

    /// @notice Returns price normalized to 1e18 (optional helper)
    function getLatestPrice1e18() external view returns (uint256) {
        (
            , 
            int256 answer,
            , 
            uint256 updatedAt,
            
        ) = priceFeed.latestRoundData();

        require(answer > 0, "invalid answer");
        require(updatedAt > block.timestamp - 1 days, "stale price");

        uint8 feedDecimals = priceFeed.decimals();
        uint256 price = uint256(answer);

        // scale to 1e18
        if (feedDecimals < 18) {
            price = price * (10 ** (18 - feedDecimals));
        } else if (feedDecimals > 18) {
            price = price / (10 ** (feedDecimals - 18));
        }

        return price; // now always 18 decimals
    }

    /// @notice Returns raw price from Chainlink (with its own decimals)
    function getLatestPrice() external view returns (int256) {
        (
            , // roundId
            int256 answer,
            , // startedAt
            uint256 updatedAt,
            // answeredInRound
        ) = priceFeed.latestRoundData();

        require(answer > 0, "invalid answer");
        require(updatedAt > block.timestamp - 1 days, "stale price");

        return answer; // e.g. 2500.00000000 if decimals = 8 => 250000000000
    }

}