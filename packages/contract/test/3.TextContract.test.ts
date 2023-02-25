// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('Text Contract', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployTextFixture() {
    const TextContractFactory = await ethers.getContractFactory('TextContract');

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const textContract = await upgrades.deployProxy(TextContractFactory, [], {
      initializer: 'initialize',
    });

    await textContract.deployed();

    return { textContract, owner, learner };
  }

  // Test case
  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { textContract, learner } = await loadFixture(deployTextFixture);

      expect(await textContract.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('getUserTextInfo', function () {
    it("return NFT's image-URL and mint status of learner", async function () {
      const { textContract, learner } = await loadFixture(deployTextFixture);

      const textStatus = await textContract.getUserTextInfo(learner.address);

      expect(textStatus.passportHash).to.equal('test');
      expect(textStatus.mintStatus).to.equal(0); // MintStatus.UNAVAILABLE
    });
  });

  describe('changeStatusUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { textContract, learner } = await loadFixture(deployTextFixture);

      await textContract.changeStatusUnavailable(learner.address);
      expect(await textContract.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { textContract, learner } = await loadFixture(deployTextFixture);

      await textContract.changeStatusAvailable(learner.address);
      expect(await textContract.getUserMintStatus(learner.address)).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { textContract, learner } = await loadFixture(deployTextFixture);

      await textContract.changeStatusDone(learner.address);
      expect(await textContract.getUserMintStatus(learner.address)).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { textContract, learner } = await loadFixture(deployTextFixture);

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ControlContract.
        await textContract.changeStatusAvailable(learner.address);

        await expect(textContract.mint(learner.address))
          .to.emit(textContract, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { textContract, learner } = await loadFixture(deployTextFixture);

        // check status UNAVAILABLE
        await expect(textContract.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { textContract, learner } = await loadFixture(deployTextFixture);

        // check status DONE
        await textContract.changeStatusDone(learner.address);
        await expect(textContract.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { textContract, owner, learner } = await loadFixture(
        deployTextFixture,
      );

      await expect(textContract.mintByAdmin(owner.address, learner.address))
        .to.emit(textContract, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      const { textContract, learner } = await loadFixture(deployTextFixture);
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ControlContract.
      await textContract.changeStatusAvailable(learner.address);

      await expect(textContract.mint(learner.address))
        .to.emit(textContract, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, 1);

      const getTokenURI = await textContract.tokenURI(tokenId);
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: test');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal('https://ipfs.io/ipfs/test');
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('test');
    });
  });
});
