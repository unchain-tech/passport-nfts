// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('XRPL_NFT_Maker', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const XRPLNFTMakerFactory = await ethers.getContractFactory(
      'XRPL_NFT_Maker',
    );

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const XRPLNFTMaker = await upgrades.deployProxy(XRPLNFTMakerFactory, [], {
      initializer: 'initialize',
    });

    await XRPLNFTMaker.deployed();

    return { XRPLNFTMaker, owner, learner };
  }

  // Test case
  describe('getProjectName', function () {
    it('return project name', async function () {
      const { XRPLNFTMaker } = await loadFixture(deployProjectFixture);

      expect(await XRPLNFTMaker.getProjectName()).to.equal('XRPL NFT Maker');
    });
  });

  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { XRPLNFTMaker } = await loadFixture(deployProjectFixture);

      expect(await XRPLNFTMaker.getPassportHash()).to.equal(
        'QmYkdzfNrVnN3qsDXY3UGbemg7x1ezE2kdtdsZznPv6cjb', // TODO: Update ipfs hash
      );
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { XRPLNFTMaker, learner } = await loadFixture(deployProjectFixture);

      expect(await XRPLNFTMaker.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { XRPLNFTMaker, learner } = await loadFixture(deployProjectFixture);

      await XRPLNFTMaker.changeStatusToUnavailable(learner.address);

      expect(await XRPLNFTMaker.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { XRPLNFTMaker, learner } = await loadFixture(deployProjectFixture);

      await XRPLNFTMaker.changeStatusToAvailable(learner.address);

      expect(await XRPLNFTMaker.getUserMintStatus(learner.address)).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusToDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { XRPLNFTMaker, learner } = await loadFixture(deployProjectFixture);

      await XRPLNFTMaker.changeStatusToDone(learner.address);

      expect(await XRPLNFTMaker.getUserMintStatus(learner.address)).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { XRPLNFTMaker, learner } = await loadFixture(
          deployProjectFixture,
        );

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ProjectsController.
        await XRPLNFTMaker.changeStatusToAvailable(learner.address);

        await expect(XRPLNFTMaker.mint(learner.address))
          .to.emit(XRPLNFTMaker, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { XRPLNFTMaker, learner } = await loadFixture(
          deployProjectFixture,
        );

        await expect(XRPLNFTMaker.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { XRPLNFTMaker, learner } = await loadFixture(
          deployProjectFixture,
        );
        await XRPLNFTMaker.changeStatusToDone(learner.address);

        await expect(XRPLNFTMaker.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { XRPLNFTMaker, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(XRPLNFTMaker.mintByAdmin(owner.address, learner.address))
        .to.emit(XRPLNFTMaker, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { XRPLNFTMaker, learner } = await loadFixture(deployProjectFixture);
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ProjectsController.
      await XRPLNFTMaker.changeStatusToAvailable(learner.address);
      await expect(XRPLNFTMaker.mint(learner.address))
        .to.emit(XRPLNFTMaker, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await XRPLNFTMaker.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: XRPL NFT Maker');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(
        'https://ipfs.io/ipfs/QmYkdzfNrVnN3qsDXY3UGbemg7x1ezE2kdtdsZznPv6cjb', // TODO: Update ipfs hash
      );
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('XRPL NFT Maker');
    });
  });
});
