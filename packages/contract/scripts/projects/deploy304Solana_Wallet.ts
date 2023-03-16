import { ethers, upgrades } from 'hardhat';

async function main() {
  const SolanaWalletFactory = await ethers.getContractFactory('Solana_Wallet');
  const SolanaWallet = await upgrades.deployProxy(SolanaWalletFactory, [], {
    initializer: 'initialize',
  });
  await SolanaWallet.deployed();
  console.log('Solana_Wallet upgraded to: ', SolanaWallet.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
