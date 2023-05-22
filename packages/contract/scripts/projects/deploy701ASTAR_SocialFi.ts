import { ethers, upgrades } from 'hardhat';

async function main() {
  const ASTARSocialFiFactory = await ethers.getContractFactory(
    'ASTAR_SocialFi',
  );
  const ASTARSocialFi = await upgrades.deployProxy(ASTARSocialFiFactory, [], {
    initializer: 'initialize',
  });
  await ASTARSocialFi.deployed();
  console.log('ASTAR_SocialFi upgraded to: ', ASTARSocialFi.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
