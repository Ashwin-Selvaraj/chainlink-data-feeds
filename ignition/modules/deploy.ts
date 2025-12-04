import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";


// Get treasury address from environment or use default
const CHAINLINK_PRICE_ADDRESS = process.env.CHAINLINK_PRICE_ADDRESS || "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526";

export default buildModule("ChainlinkPriceModule", (m) => {
    const chainlinkPrice = m.contract("ChainlinkPrice", [CHAINLINK_PRICE_ADDRESS]);
    return { chainlinkPrice };
});



//deployment command
//npm run deploy -- --network bscTestnet

//verification command
//npx hardhat verify --network bscTestnet 0x0DcA78FBe65099cda8D118dC09b58B37970b6A56 "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"