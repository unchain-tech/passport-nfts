// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('ETH_NFT_Maker', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const ETHNFTMakerFactory = await ethers.getContractFactory('ETH_NFT_Maker');

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const ETHNFTMaker = await upgrades.deployProxy(ETHNFTMakerFactory, [], {
      initializer: 'initialize',
    });

    await ETHNFTMaker.deployed();

    return { ETHNFTMaker, owner, learner };
  }

  // Test case
  describe('getProjectName', function () {
    it('return project name', async function () {
      const { ETHNFTMaker } = await loadFixture(deployProjectFixture);

      expect(await ETHNFTMaker.getProjectName()).to.equal('ETH NFT Maker');
    });
  });

  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { ETHNFTMaker } = await loadFixture(deployProjectFixture);

      expect(await ETHNFTMaker.getPassportHash()).to.equal(
        'Qmcs93RjJCsBmrW5iiaaQzwPv8pq2F5TdquPJ2frstStMP',
      );
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { ETHNFTMaker, learner } = await loadFixture(deployProjectFixture);

      expect(await ETHNFTMaker.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { ETHNFTMaker, learner } = await loadFixture(deployProjectFixture);

      await ETHNFTMaker.changeStatusToUnavailable(learner.address);

      expect(await ETHNFTMaker.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { ETHNFTMaker, learner } = await loadFixture(deployProjectFixture);

      await ETHNFTMaker.changeStatusToAvailable(learner.address);

      expect(await ETHNFTMaker.getUserMintStatus(learner.address)).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusToDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { ETHNFTMaker, learner } = await loadFixture(deployProjectFixture);

      await ETHNFTMaker.changeStatusToDone(learner.address);

      expect(await ETHNFTMaker.getUserMintStatus(learner.address)).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { ETHNFTMaker, learner } = await loadFixture(
          deployProjectFixture,
        );

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ProjectsController.
        await ETHNFTMaker.changeStatusToAvailable(learner.address);

        await expect(ETHNFTMaker.mint(learner.address))
          .to.emit(ETHNFTMaker, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { ETHNFTMaker, learner } = await loadFixture(
          deployProjectFixture,
        );

        await expect(ETHNFTMaker.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { ETHNFTMaker, learner } = await loadFixture(
          deployProjectFixture,
        );
        await ETHNFTMaker.changeStatusToDone(learner.address);

        await expect(ETHNFTMaker.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { ETHNFTMaker, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(ETHNFTMaker.mintByAdmin(owner.address, learner.address))
        .to.emit(ETHNFTMaker, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { ETHNFTMaker, learner } = await loadFixture(deployProjectFixture);
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ProjectsController.
      await ETHNFTMaker.changeStatusToAvailable(learner.address);
      await expect(ETHNFTMaker.mint(learner.address))
        .to.emit(ETHNFTMaker, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await ETHNFTMaker.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: ETH NFT Maker');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(
        'https://ipfs.io/ipfs/Qmcs93RjJCsBmrW5iiaaQzwPv8pq2F5TdquPJ2frstStMP',
      );
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('ETH NFT Maker');
    });
  });
});