import { ethers, upgrades } from 'hardhat';

async function main() {
  const ETHYieldFarmFactory = await ethers.getContractFactory('ETH_Yield_Farm');
  const ETHYieldFarm = await upgrades.deployProxy(ETHYieldFarmFactory, [], {
    initializer: 'initialize',
  });
  await ETHYieldFarm.deployed();
  console.log('ETH_Yield_Farm upgraded to: ', ETHYieldFarm.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
