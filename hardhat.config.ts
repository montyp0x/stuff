import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

export const ETH_NODE_URI="https://rpc.ankr.com/eth"
export const BLOCK_NUMBER=18724090
export const USER_ADDRESS="0x30A20b0281Df39e6337c3cbE5865E6fdCDcCe3f1"



const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    hardhat: {
      forking: {
          url: ETH_NODE_URI,
          blockNumber: BLOCK_NUMBER
      },  
    },
  }
};

export default config;
