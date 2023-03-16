import { ethers, upgrades } from 'hardhat';

async function main() {
  const SolanaNFTDropFactory = await ethers.getContractFactory(
    'Solana_NFT_Drop',
  );
  const SolanaNFTDrop = await upgrades.deployProxy(SolanaNFTDropFactory, [], {
    initializer: 'initialize',
  });
  await SolanaNFTDrop.deployed();
  console.log('Solana_NFT_Drop upgraded to: ', SolanaNFTDrop.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
