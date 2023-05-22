import { ethers, upgrades } from 'hardhat';

async function main() {
  const AVAXAssetTokenizationFactory = await ethers.getContractFactory(
    'AVAX_Asset_Tokenization',
  );
  const AVAXAssetTokenization = await upgrades.deployProxy(
    AVAXAssetTokenizationFactory,
    [],
    {
      initializer: 'initialize',
    },
  );
  await AVAXAssetTokenization.deployed();
  console.log(
    'AVAX_Asset_Tokenization upgraded to: ',
    AVAXAssetTokenization.address,
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
