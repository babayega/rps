import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        runs: 200,
        enabled: true,
      },
    },
  },
  networks: {
    arb_gor: {
      chainId: 421613,
      url: process.env.ARB_GOR_RPC || "",
      accounts:
        process.env.PVT_KEY !== undefined
          ? [process.env.PVT_KEY]
          : [],
    },
    gor_eth: {
      chainId: 5,
      url: process.env.GOR_RPC || "",
      gas: 2100000,
      accounts:
        process.env.PVT_KEY !== undefined
          ? [process.env.PVT_KEY]
          : [],
    },
    opt_gor: {
      chainId: 420,
      url: process.env.OPT_GOR_RPC || "",
      gas: 2100000,
      accounts:
        process.env.PVT_KEY !== undefined
          ? [process.env.PVT_KEY]
          : [],
    },
  },
  paths: {
    deploy: "scripts/deploy",
    deployments: "deployments",
  },
  namedAccounts: {
    deployer: 0
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
