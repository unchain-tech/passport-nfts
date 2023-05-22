import { ethers, upgrades } from 'hardhat';

async function main() {
  const PolygonENSDomainFactory = await ethers.getContractFactory(
    'Polygon_ENS_Domain',
  );
  const PolygonENSDomain = await upgrades.deployProxy(
    PolygonENSDomainFactory,
    [],
    {
      initializer: 'initialize',
    },
  );
  await PolygonENSDomain.deployed();
  console.log('Polygon_ENS_Domain upgraded to: ', PolygonENSDomain.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
