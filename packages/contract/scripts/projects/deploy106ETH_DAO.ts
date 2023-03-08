import { ethers, upgrades } from 'hardhat';

async function main() {
  const ETHDAOFactory = await ethers.getContractFactory('ETH_DAO');
  const ETHDAO = await upgrades.deployProxy(ETHDAOFactory, [], {
    initializer: 'initialize',
  });
  await ETHDAO.deployed();
  console.log('ETH_DAO upgraded to: ', ETHDAO.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
