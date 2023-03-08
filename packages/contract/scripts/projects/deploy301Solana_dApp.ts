import { ethers, upgrades } from 'hardhat';

async function main() {
  const SolanaDappFactory = await ethers.getContractFactory('Solana_dApp');
  const SolanaDapp = await upgrades.deployProxy(SolanaDappFactory, [], {
    initializer: 'initialize',
  });
  await SolanaDapp.deployed();
  console.log('Solana_dApp upgraded to: ', SolanaDapp.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
