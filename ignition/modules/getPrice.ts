import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";
import {readFileSync} from "fs";
import {join} from "path";

// Read the deployed address from the deployment file
const deploymentPath = join(process.cwd(), "ignition/deployments/chain-97/deployed_addresses.json");
const deployedAddresses = JSON.parse(readFileSync(deploymentPath, "utf-8"));
const contractAddress = deployedAddresses["ChainlinkPriceModule#ChainlinkPrice"];

export default buildModule("GetPriceModule", (m) => {
    const chainlinkPrice = m.contractAt("ChainlinkPrice", contractAddress);
    return { chainlinkPrice };
});