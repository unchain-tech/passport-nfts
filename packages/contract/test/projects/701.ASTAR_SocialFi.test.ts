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
    // Define a private variable from the contract for testing
    const passportHash = 'QmPNEXc1yuPKyzmin3rqp3jFBN9RgMe75AMuNd7PaR4eLr';

    const ASTARSocialFi = await upgrades.deployProxy(ASTARSocialFiFactory, [], {
      initializer: 'initialize',
    });

    await ASTARSocialFi.deployed();

    return { ASTARSocialFi, owner, learner, passportHash };
  }

  // Test case
  describe('getProjectName', function () {
    it('return project name', async function () {
      const { ASTARSocialFi } = await loadFixture(deployProjectFixture);

      expect(await ASTARSocialFi.getProjectName()).to.equal('ASTAR SocialFi');
    });
  });

  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { ASTARSocialFi, passportHash } = await loadFixture(
        deployProjectFixture,
      );

      expect(await ASTARSocialFi.getPassportHash()).to.equal(passportHash);
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
        // with the Controller-Role calling from ProjectsController.
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
      const { ASTARSocialFi, learner, passportHash } = await loadFixture(
        deployProjectFixture,
      );
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ProjectsController.
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
      expect(object.image).to.equal(`https://ipfs.io/ipfs/${passportHash}`);
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('ASTAR SocialFi');
    });
  });
});
