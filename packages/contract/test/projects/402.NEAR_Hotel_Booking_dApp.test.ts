// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('NEAR_Hotel_Booking_dApp', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const NEARHotelBookingDappFactory = await ethers.getContractFactory(
      'NEAR_Hotel_Booking_dApp',
    );

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const NEARHotelBookingDapp = await upgrades.deployProxy(
      NEARHotelBookingDappFactory,
      [],
      {
        initializer: 'initialize',
      },
    );

    await NEARHotelBookingDapp.deployed();

    return { NEARHotelBookingDapp, owner, learner };
  }

  // Test case
  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { NEARHotelBookingDapp } = await loadFixture(deployProjectFixture);

      expect(await NEARHotelBookingDapp.getPassportHash()).to.equal(
        'QmZKpqK3Vn4GViQoCFqE7NfobWvprFch4qrFaK21zf5RWp',
      );
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { NEARHotelBookingDapp, learner } = await loadFixture(
        deployProjectFixture,
      );

      expect(
        await NEARHotelBookingDapp.getUserMintStatus(learner.address),
      ).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { NEARHotelBookingDapp, learner } = await loadFixture(
        deployProjectFixture,
      );

      await NEARHotelBookingDapp.changeStatusToUnavailable(learner.address);

      expect(
        await NEARHotelBookingDapp.getUserMintStatus(learner.address),
      ).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { NEARHotelBookingDapp, learner } = await loadFixture(
        deployProjectFixture,
      );

      await NEARHotelBookingDapp.changeStatusToAvailable(learner.address);

      expect(
        await NEARHotelBookingDapp.getUserMintStatus(learner.address),
      ).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusToDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { NEARHotelBookingDapp, learner } = await loadFixture(
        deployProjectFixture,
      );

      await NEARHotelBookingDapp.changeStatusToDone(learner.address);

      expect(
        await NEARHotelBookingDapp.getUserMintStatus(learner.address),
      ).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { NEARHotelBookingDapp, learner } = await loadFixture(
          deployProjectFixture,
        );

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ProjectsController.
        await NEARHotelBookingDapp.changeStatusToAvailable(learner.address);

        await expect(NEARHotelBookingDapp.mint(learner.address))
          .to.emit(NEARHotelBookingDapp, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { NEARHotelBookingDapp, learner } = await loadFixture(
          deployProjectFixture,
        );

        await expect(
          NEARHotelBookingDapp.mint(learner.address),
        ).to.be.revertedWith("you're mint status is not AVAILABLE!");
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { NEARHotelBookingDapp, learner } = await loadFixture(
          deployProjectFixture,
        );
        await NEARHotelBookingDapp.changeStatusToDone(learner.address);

        await expect(
          NEARHotelBookingDapp.mint(learner.address),
        ).to.be.revertedWith("you're mint status is not AVAILABLE!");
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { NEARHotelBookingDapp, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(
        NEARHotelBookingDapp.mintByAdmin(owner.address, learner.address),
      )
        .to.emit(NEARHotelBookingDapp, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { NEARHotelBookingDapp, learner } = await loadFixture(
        deployProjectFixture,
      );
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ProjectsController.
      await NEARHotelBookingDapp.changeStatusToAvailable(learner.address);
      await expect(NEARHotelBookingDapp.mint(learner.address))
        .to.emit(NEARHotelBookingDapp, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await NEARHotelBookingDapp.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: NEAR Hotel Booking dApp');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(
        'https://ipfs.io/ipfs/QmZKpqK3Vn4GViQoCFqE7NfobWvprFch4qrFaK21zf5RWp',
      );
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('NEAR Hotel Booking dApp');
    });
  });
});
