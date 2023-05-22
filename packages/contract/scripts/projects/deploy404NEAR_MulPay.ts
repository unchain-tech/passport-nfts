import { ethers, upgrades } from 'hardhat';

async function main() {
  const NEARMulPayFactory = await ethers.getContractFactory('NEAR_MulPay');
  const NEARMulPay = await upgrades.deployProxy(NEARMulPayFactory, [], {
    initializer: 'initialize',
  });
  await NEARMulPay.deployed();
  console.log('NEAR_MulPay upgraded to: ', NEARMulPay.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
