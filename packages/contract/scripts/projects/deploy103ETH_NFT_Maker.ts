import { ethers, upgrades } from 'hardhat';

async function main() {
  const ETHNFTMakerFactory = await ethers.getContractFactory('ETH_NFT_Maker');
  const ETHNFTMaker = await upgrades.deployProxy(ETHNFTMakerFactory, [], {
    initializer: 'initialize',
  });
  await ETHNFTMaker.deployed();
  console.log('ETH_NFT_Maker upgraded to: ', ETHNFTMaker.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
