// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('ETH_DAO', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const ETHDAOFactory = await ethers.getContractFactory('ETH_DAO');

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const ETHDAO = await upgrades.deployProxy(ETHDAOFactory, [], {
      initializer: 'initialize',
    });

    await ETHDAO.deployed();

    return { ETHDAO, owner, learner };
  }

  // Test case
  describe('getProjectName', function () {
    it('return project name', async function () {
      const { ETHDAO } = await loadFixture(deployProjectFixture);

      expect(await ETHDAO.getProjectName()).to.equal('ETH DAO');
    });
  });

  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { ETHDAO } = await loadFixture(deployProjectFixture);

      expect(await ETHDAO.getPassportHash()).to.equal(
        'Qma3C4TyC7Msb8XfLbaB26PMmqyPL3UqwZ9dJL19nEy3AD',
      );
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { ETHDAO, learner } = await loadFixture(deployProjectFixture);

      expect(await ETHDAO.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { ETHDAO, learner } = await loadFixture(deployProjectFixture);

      await ETHDAO.changeStatusToUnavailable(learner.address);

      expect(await ETHDAO.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { ETHDAO, learner } = await loadFixture(deployProjectFixture);

      await ETHDAO.changeStatusToAvailable(learner.address);

      expect(await ETHDAO.getUserMintStatus(learner.address)).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusToDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { ETHDAO, learner } = await loadFixture(deployProjectFixture);

      await ETHDAO.changeStatusToDone(learner.address);

      expect(await ETHDAO.getUserMintStatus(learner.address)).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { ETHDAO, learner } = await loadFixture(deployProjectFixture);

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ProjectsController.
        await ETHDAO.changeStatusToAvailable(learner.address);

        await expect(ETHDAO.mint(learner.address))
          .to.emit(ETHDAO, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { ETHDAO, learner } = await loadFixture(deployProjectFixture);

        await expect(ETHDAO.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { ETHDAO, learner } = await loadFixture(deployProjectFixture);
        await ETHDAO.changeStatusToDone(learner.address);

        await expect(ETHDAO.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { ETHDAO, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(ETHDAO.mintByAdmin(owner.address, learner.address))
        .to.emit(ETHDAO, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { ETHDAO, learner } = await loadFixture(deployProjectFixture);
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ProjectsController.
      await ETHDAO.changeStatusToAvailable(learner.address);
      await expect(ETHDAO.mint(learner.address))
        .to.emit(ETHDAO, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await ETHDAO.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: ETH DAO');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(
        'https://ipfs.io/ipfs/Qma3C4TyC7Msb8XfLbaB26PMmqyPL3UqwZ9dJL19nEy3AD',
      );
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('ETH DAO');
    });
  });
});
