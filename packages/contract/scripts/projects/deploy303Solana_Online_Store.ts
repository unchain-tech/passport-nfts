import { ethers, upgrades } from 'hardhat';

async function main() {
  const SolanaOnlineStoreFactory = await ethers.getContractFactory(
    'Solana_Online_Store',
  );
  const SolanaOnlineStore = await upgrades.deployProxy(
    SolanaOnlineStoreFactory,
    [],
    {
      initializer: 'initialize',
    },
  );
  await SolanaOnlineStore.deployed();
  console.log('Solana_Online_Store upgraded to: ', SolanaOnlineStore.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
