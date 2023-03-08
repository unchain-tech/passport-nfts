import { ethers, upgrades } from 'hardhat';

async function main() {
  const ProjectsControllerFactory = await ethers.getContractFactory(
    'ProjectsController',
  );
  const ProjectsController = await upgrades.deployProxy(
    ProjectsControllerFactory,
    [],
    {
      initializer: 'initialize',
    },
  );
  await ProjectsController.deployed();
  console.log('ProjectsController upgraded to: ', ProjectsController.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
