import { ethers, upgrades } from 'hardhat';

async function main() {
  const NEARElectionDappFactory = await ethers.getContractFactory(
    'NEAR_Election_dApp',
  );
  const NEARElectionDapp = await upgrades.deployProxy(
    NEARElectionDappFactory,
    [],
    {
      initializer: 'initialize',
    },
  );
  await NEARElectionDapp.deployed();
  console.log('NEAR_Election_dApp upgraded to: ', NEARElectionDapp.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
