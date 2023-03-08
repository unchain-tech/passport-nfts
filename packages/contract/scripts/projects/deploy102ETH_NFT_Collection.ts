import { ethers, upgrades } from 'hardhat';

async function main() {
  const ETHNFTCollectionFactory = await ethers.getContractFactory(
    'ETH_NFT_Collection',
  );
  const ETHNFTCollection = await upgrades.deployProxy(
    ETHNFTCollectionFactory,
    [],
    {
      initializer: 'initialize',
    },
  );
  await ETHNFTCollection.deployed();
  console.log('ETH_NFT_Collection upgraded to: ', ETHNFTCollection.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
