import { ethers, upgrades } from 'hardhat';

async function main() {
  const NEARHotelBookingDappFactory = await ethers.getContractFactory(
    'NEAR_Hotel_Booking_dApp',
  );
  const NEARHotelBookingDapp = await upgrades.deployProxy(
    NEARHotelBookingDappFactory,
    [],
    {
      initializer: 'initialize',
    },
  );
  await NEARHotelBookingDapp.deployed();
  console.log(
    'NEAR_Hotel_Booking_dApp upgraded to: ',
    NEARHotelBookingDapp.address,
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
