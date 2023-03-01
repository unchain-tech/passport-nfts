// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('Solana_dApp', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const SolanaDappFactory = await ethers.getContractFactory('Solana_dApp');

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const SolanaDapp = await upgrades.deployProxy(SolanaDappFactory, [], {
      initializer: 'initialize',
    });

    await SolanaDapp.deployed();

    return { SolanaDapp, owner, learner };
  }

  // Test case
  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { SolanaDapp } = await loadFixture(deployProjectFixture);

      expect(await SolanaDapp.getPassportHash()).to.equal(
        'QmUCZwUTTpZdSoZ9Lqe8bsqJ8EnpEsphYwSBEFc7kXfzt6',
      );
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { SolanaDapp, learner } = await loadFixture(deployProjectFixture);

      expect(await SolanaDapp.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('getUserProjectInfo', function () {
    it("return NFT's image-URL and mint status of learner", async function () {
      const { SolanaDapp, learner } = await loadFixture(deployProjectFixture);

      const textStatus = await SolanaDapp.getUserProjectInfo(learner.address);

      expect(textStatus.passportHash).to.equal(
        'QmUCZwUTTpZdSoZ9Lqe8bsqJ8EnpEsphYwSBEFc7kXfzt6',
      );
      expect(textStatus.mintStatus).to.equal(0); // MintStatus.UNAVAILABLE
    });
  });

  describe('changeStatusToUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { SolanaDapp, learner } = await loadFixture(deployProjectFixture);

      await SolanaDapp.changeStatusToUnavailable(learner.address);

      expect(await SolanaDapp.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { SolanaDapp, learner } = await loadFixture(deployProjectFixture);

      await SolanaDapp.changeStatusToAvailable(learner.address);

      expect(await SolanaDapp.getUserMintStatus(learner.address)).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusToDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { SolanaDapp, learner } = await loadFixture(deployProjectFixture);

      await SolanaDapp.changeStatusToDone(learner.address);

      expect(await SolanaDapp.getUserMintStatus(learner.address)).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { SolanaDapp, learner } = await loadFixture(deployProjectFixture);

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ControlContract.
        await SolanaDapp.changeStatusToAvailable(learner.address);

        await expect(SolanaDapp.mint(learner.address))
          .to.emit(SolanaDapp, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { SolanaDapp, learner } = await loadFixture(deployProjectFixture);

        await expect(SolanaDapp.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { SolanaDapp, learner } = await loadFixture(deployProjectFixture);
        await SolanaDapp.changeStatusToDone(learner.address);

        await expect(SolanaDapp.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { SolanaDapp, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(SolanaDapp.mintByAdmin(owner.address, learner.address))
        .to.emit(SolanaDapp, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { SolanaDapp, learner } = await loadFixture(deployProjectFixture);
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ControlContract.
      await SolanaDapp.changeStatusToAvailable(learner.address);
      await expect(SolanaDapp.mint(learner.address))
        .to.emit(SolanaDapp, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await SolanaDapp.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: Solana dApp');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(
        'https://ipfs.io/ipfs/QmUCZwUTTpZdSoZ9Lqe8bsqJ8EnpEsphYwSBEFc7kXfzt6',
      );
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('Solana dApp');
    });
  });
});
