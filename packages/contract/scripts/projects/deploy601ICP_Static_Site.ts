import { ethers, upgrades } from 'hardhat';

async function main() {
  const ICPStaticSiteFactory = await ethers.getContractFactory(
    'ICP_Static_Site',
  );
  const ICPStaticSite = await upgrades.deployProxy(ICPStaticSiteFactory, [], {
    initializer: 'initialize',
  });
  await ICPStaticSite.deployed();
  console.log('ICP_Static_Site upgraded to: ', ICPStaticSite.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
