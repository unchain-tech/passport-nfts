import { ethers, upgrades } from 'hardhat';

async function main() {
  const XRPLNFTMakerFactory = await ethers.getContractFactory('XRPL_NFT_Maker');
  const XRPLNFTMaker = await upgrades.deployProxy(XRPLNFTMakerFactory, [], {
    initializer: 'initialize',
  });
  await XRPLNFTMaker.deployed();
  console.log('XRPL_NFT_Maker upgraded to: ', XRPLNFTMaker.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
