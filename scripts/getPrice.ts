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

// Get the price feed address to check what feed we're using
const priceFeedAddress = await chainlinkPrice.priceFeed();
console.log("Price Feed Address:", priceFeedAddress);

// Get raw price (with Chainlink's decimals)
const rawPrice = await chainlinkPrice.getLatestPrice();
console.log("Raw Price (with Chainlink decimals):", rawPrice.toString());

// Get normalized price (1e18)
const normalizedPrice = await chainlinkPrice.getLatestPrice1e18();
console.log("Normalized Price (1e18):", normalizedPrice.toString());

// Format for better readability
try {
    const priceFeed = await ethers.getContractAt("IAggregatorV3", priceFeedAddress);
    const decimals = await priceFeed.decimals();
    const formattedPrice = Number(rawPrice) / (10 ** Number(decimals));
    console.log(`Formatted Price (${decimals} decimals):`, formattedPrice);
} catch (error) {
    console.log("Could not fetch decimals from price feed");
}

