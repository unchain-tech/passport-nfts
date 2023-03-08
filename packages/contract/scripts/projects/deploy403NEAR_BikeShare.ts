import { ethers, upgrades } from 'hardhat';

async function main() {
  const NEARBikeShareFactory = await ethers.getContractFactory(
    'NEAR_BikeShare',
  );
  const NEARBikeShare = await upgrades.deployProxy(NEARBikeShareFactory, [], {
    initializer: 'initialize',
  });
  await NEARBikeShare.deployed();
  console.log('NEAR_BikeShare upgraded to: ', NEARBikeShare.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
