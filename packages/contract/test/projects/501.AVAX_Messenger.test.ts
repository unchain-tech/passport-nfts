// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('AVAX_Messenger', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const AVAXMessengerFactory = await ethers.getContractFactory(
      'AVAX_Messenger',
    );

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();
    // Define a private variable from the contract for testing
    const passportHash = 'QmdqiBAa1nQaCovvyjdHMnvHL2oZL4mk1uPPFie5LNC71k';

    const AVAXMessenger = await upgrades.deployProxy(AVAXMessengerFactory, [], {
      initializer: 'initialize',
    });

    await AVAXMessenger.deployed();

    return { AVAXMessenger, owner, learner, passportHash };
  }

  // Test case
  describe('getProjectName', function () {
    it('return project name', async function () {
      const { AVAXMessenger } = await loadFixture(deployProjectFixture);

      expect(await AVAXMessenger.getProjectName()).to.equal('AVAX Messenger');
    });
  });

  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { AVAXMessenger, passportHash } = await loadFixture(
        deployProjectFixture,
      );

      expect(await AVAXMessenger.getPassportHash()).to.equal(passportHash);
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { AVAXMessenger, learner } = await loadFixture(
        deployProjectFixture,
      );

      expect(await AVAXMessenger.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { AVAXMessenger, learner } = await loadFixture(
        deployProjectFixture,
      );

      await AVAXMessenger.changeStatusToUnavailable(learner.address);

      expect(await AVAXMessenger.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { AVAXMessenger, learner } = await loadFixture(
        deployProjectFixture,
      );

      await AVAXMessenger.changeStatusToAvailable(learner.address);

      expect(await AVAXMessenger.getUserMintStatus(learner.address)).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusToDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { AVAXMessenger, learner } = await loadFixture(
        deployProjectFixture,
      );

      await AVAXMessenger.changeStatusToDone(learner.address);

      expect(await AVAXMessenger.getUserMintStatus(learner.address)).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { AVAXMessenger, learner } = await loadFixture(
          deployProjectFixture,
        );

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ProjectsController.
        await AVAXMessenger.changeStatusToAvailable(learner.address);

        await expect(AVAXMessenger.mint(learner.address))
          .to.emit(AVAXMessenger, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { AVAXMessenger, learner } = await loadFixture(
          deployProjectFixture,
        );

        await expect(AVAXMessenger.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { AVAXMessenger, learner } = await loadFixture(
          deployProjectFixture,
        );
        await AVAXMessenger.changeStatusToDone(learner.address);

        await expect(AVAXMessenger.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { AVAXMessenger, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(AVAXMessenger.mintByAdmin(owner.address, learner.address))
        .to.emit(AVAXMessenger, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { AVAXMessenger, learner, passportHash } = await loadFixture(
        deployProjectFixture,
      );
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ProjectsController.
      await AVAXMessenger.changeStatusToAvailable(learner.address);
      await expect(AVAXMessenger.mint(learner.address))
        .to.emit(AVAXMessenger, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await AVAXMessenger.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: AVAX Messenger');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(`https://ipfs.io/ipfs/${passportHash}`);
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('AVAX Messenger');
    });
  });
});
