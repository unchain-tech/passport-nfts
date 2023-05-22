import { ethers, upgrades } from 'hardhat';

async function main() {
  const ETHNFTGameFactory = await ethers.getContractFactory('ETH_NFT_Game');
  const ETHNFTGame = await upgrades.deployProxy(ETHNFTGameFactory, [], {
    initializer: 'initialize',
  });
  await ETHNFTGame.deployed();
  console.log('ETH_NFT_Game upgraded to: ', ETHNFTGame.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
