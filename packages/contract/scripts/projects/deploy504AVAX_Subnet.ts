import { ethers, upgrades } from 'hardhat';

async function main() {
  const AVAXSubnetFactory = await ethers.getContractFactory('AVAX_Subnet');
  const AVAXSubnet = await upgrades.deployProxy(AVAXSubnetFactory, [], {
    initializer: 'initialize',
  });
  await AVAXSubnet.deployed();
  console.log('AVAX_Subnet upgraded to: ', AVAXSubnet.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
