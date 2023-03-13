import * as dotenv from 'dotenv';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@openzeppelin/hardhat-upgrades';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import { HardhatUserConfig, task } from 'hardhat/config';
import 'solidity-coverage';

dotenv.config();
const { API_URL, PRIVATE_KEY, REPORT_GAS, ETHERSCAN_API_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  defaultNetwork: 'hardhat',
  networks: {
    polygon_mumbai: {
      url:
        API_URL ||
        'https://polygon-mumbai.g.alchemy.com/v2/123abc123abc123abc123abc123abcde',
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : [],
    },
  },
  gasReporter: {
    enabled: REPORT_GAS !== undefined,
    currency: 'USD',
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  paths: {
    artifacts: '../client/artifacts',
  },
};

export default config;
