import { ethers, upgrades } from 'hardhat';

async function main() {
  const AVAXAMMFactory = await ethers.getContractFactory('AVAX_AMM');
  const AVAXAMM = await upgrades.deployProxy(AVAXAMMFactory, [], {
    initializer: 'initialize',
  });
  await AVAXAMM.deployed();
  console.log('AVAX_AMM upgraded to: ', AVAXAMM.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
