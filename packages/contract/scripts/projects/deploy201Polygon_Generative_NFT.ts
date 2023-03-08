import { ethers, upgrades } from 'hardhat';

async function main() {
  const PolygonGenerativeNFTFactory = await ethers.getContractFactory(
    'Polygon_Generative_NFT',
  );
  const PolygonGenerativeNFT = await upgrades.deployProxy(
    PolygonGenerativeNFTFactory,
    [],
    {
      initializer: 'initialize',
    },
  );
  await PolygonGenerativeNFT.deployed();
  console.log(
    'Polygon_Generative_NFT upgraded to: ',
    PolygonGenerativeNFT.address,
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
