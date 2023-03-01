// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('AVAX_AMM', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const AVAXAMMFactory = await ethers.getContractFactory('AVAX_AMM');

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const AVAXAMM = await upgrades.deployProxy(AVAXAMMFactory, [], {
      initializer: 'initialize',
    });

    await AVAXAMM.deployed();

    return { AVAXAMM, owner, learner };
  }

  // Test case
  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { AVAXAMM } = await loadFixture(deployProjectFixture);

      expect(await AVAXAMM.getPassportHash()).to.equal(
        'QmRbFSiZUCAdKSB3dsZzVWUThpTJURFhMHhm2hr6rw8GfH',
      );
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { AVAXAMM, learner } = await loadFixture(deployProjectFixture);

      expect(await AVAXAMM.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('getUserProjectInfo', function () {
    it("return NFT's image-URL and mint status of learner", async function () {
      const { AVAXAMM, learner } = await loadFixture(deployProjectFixture);

      const textStatus = await AVAXAMM.getUserProjectInfo(learner.address);

      expect(textStatus.passportHash).to.equal(
        'QmRbFSiZUCAdKSB3dsZzVWUThpTJURFhMHhm2hr6rw8GfH',
      );
      expect(textStatus.mintStatus).to.equal(0); // MintStatus.UNAVAILABLE
    });
  });

  describe('changeStatusUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { AVAXAMM, learner } = await loadFixture(deployProjectFixture);

      await AVAXAMM.changeStatusUnavailable(learner.address);

      expect(await AVAXAMM.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { AVAXAMM, learner } = await loadFixture(deployProjectFixture);

      await AVAXAMM.changeStatusAvailable(learner.address);

      expect(await AVAXAMM.getUserMintStatus(learner.address)).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { AVAXAMM, learner } = await loadFixture(deployProjectFixture);

      await AVAXAMM.changeStatusDone(learner.address);

      expect(await AVAXAMM.getUserMintStatus(learner.address)).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { AVAXAMM, learner } = await loadFixture(deployProjectFixture);

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ControlContract.
        await AVAXAMM.changeStatusAvailable(learner.address);

        await expect(AVAXAMM.mint(learner.address))
          .to.emit(AVAXAMM, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { AVAXAMM, learner } = await loadFixture(deployProjectFixture);

        await expect(AVAXAMM.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { AVAXAMM, learner } = await loadFixture(deployProjectFixture);
        await AVAXAMM.changeStatusDone(learner.address);

        await expect(AVAXAMM.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { AVAXAMM, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(AVAXAMM.mintByAdmin(owner.address, learner.address))
        .to.emit(AVAXAMM, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { AVAXAMM, learner } = await loadFixture(deployProjectFixture);
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ControlContract.
      await AVAXAMM.changeStatusAvailable(learner.address);
      await expect(AVAXAMM.mint(learner.address))
        .to.emit(AVAXAMM, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await AVAXAMM.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: AVAX AMM');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(
        'https://ipfs.io/ipfs/QmRbFSiZUCAdKSB3dsZzVWUThpTJURFhMHhm2hr6rw8GfH',
      );
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('AVAX AMM');
    });
  });
});
