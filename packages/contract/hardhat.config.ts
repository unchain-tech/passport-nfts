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

// Sample Hardhat task. See: https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
//     const accounts = await hre.ethers.getSigners()

//     for (const account of accounts) {
//         console.log(account.address)
//     }
// })

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
};

export default config;
