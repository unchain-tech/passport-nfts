import { ethers, upgrades } from 'hardhat';

async function main() {
  // If this script is run directly using `node` instead of `npx hardhat run` you may want to call compile manually to make sure everything is compiled
  // await hre.run('compile');

  const v1Factory = await ethers.getContractFactory('UNCHAIN_PASSPORT_v01');
  const v2Factory = await ethers.getContractFactory('UNCHAIN_PASSPORT_v02');

  const v1Contract = await upgrades.deployProxy(v1Factory, [42], {
    initializer: 'store',
  });
  console.log('v1 deployed to:', v1Contract.address);

  const v2Contract = await upgrades.upgradeProxy(v1Contract.address, v2Factory);
  await v2Contract.deployed();
  console.log('contract upgraded to:', v2Contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
