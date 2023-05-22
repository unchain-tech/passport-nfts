import { ethers, upgrades } from 'hardhat';

async function main() {
  const PolygonMobileDappFactory = await ethers.getContractFactory(
    'Polygon_Mobile_dApp',
  );
  const PolygonMobileDapp = await upgrades.deployProxy(
    PolygonMobileDappFactory,
    [],
    {
      initializer: 'initialize',
    },
  );
  await PolygonMobileDapp.deployed();
  console.log('Polygon_Mobile_dApp upgraded to: ', PolygonMobileDapp.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
