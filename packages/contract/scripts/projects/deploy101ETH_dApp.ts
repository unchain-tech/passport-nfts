import { ethers, upgrades } from 'hardhat';

async function main() {
  const ETHDappFactory = await ethers.getContractFactory('ETH_dApp');
  const ETHDapp = await upgrades.deployProxy(ETHDappFactory, [], {
    initializer: 'initialize',
  });
  await ETHDapp.deployed();
  console.log('ETH_dApp upgraded to: ', ETHDapp.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
