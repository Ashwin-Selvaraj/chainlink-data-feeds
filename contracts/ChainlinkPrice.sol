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

    enum Token {
        BNB,
        USDT,
        ETH,
        BTC,
        DOGE,
        ADA,
        XRP
    }

    mapping(Token => IAggregatorV3) public priceFeeds;

    // Pass the Chainlink feed address in the constructor
    // e.g. BNB/USD, ETH/USD, BTC/USD, etc.
    constructor(address _BNB_USD_PriceFeed, address _USDT_USD_PriceFeed, address _ETH_USD_PriceFeed, address _BTC_USD_PriceFeed, address _DOGE_USD_PriceFeed, address _ADA_USD_PriceFeed, address _XRP_USD_PriceFeed) {
        priceFeeds[Token.BNB] = IAggregatorV3(_BNB_USD_PriceFeed);
        priceFeeds[Token.USDT] = IAggregatorV3(_USDT_USD_PriceFeed);
        priceFeeds[Token.ETH] = IAggregatorV3(_ETH_USD_PriceFeed);
        priceFeeds[Token.BTC] = IAggregatorV3(_BTC_USD_PriceFeed);
        priceFeeds[Token.DOGE] = IAggregatorV3(_DOGE_USD_PriceFeed);
        priceFeeds[Token.ADA] = IAggregatorV3(_ADA_USD_PriceFeed);
        priceFeeds[Token.XRP] = IAggregatorV3(_XRP_USD_PriceFeed);
    }

    /// @notice Returns price normalized to 1e18 (optional helper)
    /// @param token The token to get the price for (BNB, USDT, ETH, BTC, etc.)
    function getLatestPrice1e18(Token token) external view returns (uint256) {
        IAggregatorV3 priceFeed = priceFeeds[token];
        require(address(priceFeed) != address(0), "Price feed not set for this token");

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
    /// @param token The token to get the price for (BNB, USDT, ETH, BTC, etc.)
    function getLatestPrice(Token token) external view returns (int256) {
        IAggregatorV3 priceFeed = priceFeeds[token];
        require(address(priceFeed) != address(0), "Price feed not set for this token");

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
