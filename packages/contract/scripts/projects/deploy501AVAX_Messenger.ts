import { ethers, upgrades } from 'hardhat';

async function main() {
  const AVAXMessengerFactory = await ethers.getContractFactory(
    'AVAX_Messenger',
  );
  const AVAXMessenger = await upgrades.deployProxy(AVAXMessengerFactory, [], {
    initializer: 'initialize',
  });
  await AVAXMessenger.deployed();
  console.log('AVAX_Messenger upgraded to: ', AVAXMessenger.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
