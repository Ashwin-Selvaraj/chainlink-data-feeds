import { network } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

// Read the deployed address from the deployment file
const deploymentPath = join(process.cwd(), "ignition/deployments/chain-97/deployed_addresses.json");
const deployedAddresses = JSON.parse(readFileSync(deploymentPath, "utf-8"));
const contractAddress = deployedAddresses["ChainlinkPriceModule#ChainlinkPrice"];

// Connect to the network (chain-97 is BSC Testnet)
const { ethers } = await network.connect({
  network: "bscTestnet",
  chainType: "l1",
});

console.log("Connecting to deployed contract at:", contractAddress);

// Get the contract instance
const chainlinkPrice = await ethers.getContractAt("ChainlinkPrice", contractAddress);

// Token enum values: BNB=0, USDT=1, ETH=2, BTC=3, DOGE=4, ADA=5, XRP=6
const tokens = ["BNB", "USDT", "ETH", "BTC", "DOGE", "ADA", "XRP"];

// Get prices for all tokens
for (let i = 0; i < tokens.length; i++) {
    const tokenName = tokens[i];
    console.log(`\n=== ${tokenName} Price ===`);
    
    try {
        // Get the price feed address for this token (using type assertion for now)
        const priceFeeds = (chainlinkPrice as any).priceFeeds;
        const priceFeedAddress = await priceFeeds(i);
        console.log("Price Feed Address:", priceFeedAddress);
        
        if (priceFeedAddress === "0x0000000000000000000000000000000000000000") {
            console.log(`Price feed not set for ${tokenName}`);
            continue;
        }
        
        // Get raw price (with Chainlink's decimals) - using type assertion
        const getLatestPrice = (chainlinkPrice as any).getLatestPrice;
        const rawPrice = await getLatestPrice(i);
        console.log("Raw Price (with Chainlink decimals):", rawPrice.toString());
        
        // Get normalized price (1e18)
        const getLatestPrice1e18 = (chainlinkPrice as any).getLatestPrice1e18;
        const normalizedPrice = await getLatestPrice1e18(i);
        console.log("Normalized Price (1e18):", normalizedPrice.toString());
        
        // Format for better readability
        try {
            const priceFeed = await ethers.getContractAt("IAggregatorV3", priceFeedAddress);
            const decimals = await priceFeed.decimals();
            const formattedPrice = Number(rawPrice) / (10 ** Number(decimals));
            console.log(`Formatted Price (${decimals} decimals): $${formattedPrice.toFixed(2)}`);
        } catch (error) {
            console.log("Could not fetch decimals from price feed");
        }
    } catch (error: any) {
        console.log(`Error getting ${tokenName} price:`, error.message);
    }
}

