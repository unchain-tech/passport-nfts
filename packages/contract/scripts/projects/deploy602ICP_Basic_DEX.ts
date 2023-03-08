import { ethers, upgrades } from 'hardhat';

async function main() {
  const ICPBasicDEXFactory = await ethers.getContractFactory('ICP_Basic_DEX');
  const ICPBasicDEX = await upgrades.deployProxy(ICPBasicDEXFactory, [], {
    initializer: 'initialize',
  });
  await ICPBasicDEX.deployed();
  console.log('ICP_Basic_DEX upgraded to: ', ICPBasicDEX.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
