// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('ASTAR_SocialFi', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const ASTARSocialFiFactory = await ethers.getContractFactory(
      'ASTAR_SocialFi',
    );

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const ASTARSocialFi = await upgrades.deployProxy(ASTARSocialFiFactory, [], {
      initializer: 'initialize',
    });

    await ASTARSocialFi.deployed();

    return { ASTARSocialFi, owner, learner };
  }

  // Test case
  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { ASTARSocialFi } = await loadFixture(deployProjectFixture);

      expect(await ASTARSocialFi.getPassportHash()).to.equal(
        'QmYkdzfNrVnN3qsDXY3UGbemg7x1ezE2kdtdsZznPv6cjb',
      );
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { ASTARSocialFi, learner } = await loadFixture(
        deployProjectFixture,
      );

      expect(await ASTARSocialFi.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('getUserProjectInfo', function () {
    it("return NFT's image-URL and mint status of learner", async function () {
      const { ASTARSocialFi, learner } = await loadFixture(
        deployProjectFixture,
      );

      const textStatus = await ASTARSocialFi.getUserProjectInfo(
        learner.address,
      );

      expect(textStatus.passportHash).to.equal(
        'QmYkdzfNrVnN3qsDXY3UGbemg7x1ezE2kdtdsZznPv6cjb',
      );
      expect(textStatus.mintStatus).to.equal(0); // MintStatus.UNAVAILABLE
    });
  });

  describe('changeStatusToUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { ASTARSocialFi, learner } = await loadFixture(
        deployProjectFixture,
      );

      await ASTARSocialFi.changeStatusToUnavailable(learner.address);

      expect(await ASTARSocialFi.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { ASTARSocialFi, learner } = await loadFixture(
        deployProjectFixture,
      );

      await ASTARSocialFi.changeStatusToAvailable(learner.address);

      expect(await ASTARSocialFi.getUserMintStatus(learner.address)).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusToDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { ASTARSocialFi, learner } = await loadFixture(
        deployProjectFixture,
      );

      await ASTARSocialFi.changeStatusToDone(learner.address);

      expect(await ASTARSocialFi.getUserMintStatus(learner.address)).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { ASTARSocialFi, learner } = await loadFixture(
          deployProjectFixture,
        );

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ControlContract.
        await ASTARSocialFi.changeStatusToAvailable(learner.address);

        await expect(ASTARSocialFi.mint(learner.address))
          .to.emit(ASTARSocialFi, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { ASTARSocialFi, learner } = await loadFixture(
          deployProjectFixture,
        );

        await expect(ASTARSocialFi.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { ASTARSocialFi, learner } = await loadFixture(
          deployProjectFixture,
        );
        await ASTARSocialFi.changeStatusToDone(learner.address);

        await expect(ASTARSocialFi.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { ASTARSocialFi, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(ASTARSocialFi.mintByAdmin(owner.address, learner.address))
        .to.emit(ASTARSocialFi, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { ASTARSocialFi, learner } = await loadFixture(
        deployProjectFixture,
      );
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ControlContract.
      await ASTARSocialFi.changeStatusToAvailable(learner.address);
      await expect(ASTARSocialFi.mint(learner.address))
        .to.emit(ASTARSocialFi, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await ASTARSocialFi.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: ASTAR SocialFi');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(
        'https://ipfs.io/ipfs/QmYkdzfNrVnN3qsDXY3UGbemg7x1ezE2kdtdsZznPv6cjb',
      );
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('ASTAR SocialFi');
    });
  });
});
