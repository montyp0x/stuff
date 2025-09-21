import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const ETH_NODE_URI="https://eth.llamarpc.com"
export const BLOCK_NUMBER=18724090
export const USER_ADDRESS="0x30A20b0281Df39e6337c3cbE5865E6fdCDcCe3f1"

export const SEPOLIA_URL="https://1rpc.io/sepolia"



const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    hardhat: {
      forking: {
          url: ETH_NODE_URI,
          blockNumber: BLOCK_NUMBER
      },  
    },
    sepolia: {
      url: SEPOLIA_URL,
      accounts: process.env.PK !== undefined ? [process.env.PK] : [],
    },
  }
};

export default config;
