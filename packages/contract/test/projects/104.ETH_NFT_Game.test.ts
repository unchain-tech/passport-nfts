// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('ETH_NFT_Game', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const ETHNFTGameFactory = await ethers.getContractFactory('ETH_NFT_Game');

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const ETHNFTGame = await upgrades.deployProxy(ETHNFTGameFactory, [], {
      initializer: 'initialize',
    });

    await ETHNFTGame.deployed();

    return { ETHNFTGame, owner, learner };
  }

  // Test case
  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { ETHNFTGame } = await loadFixture(deployProjectFixture);

      expect(await ETHNFTGame.getPassportHash()).to.equal(
        'QmXrwaPtpgLmmJUq9Bgk9qgqHvbnz6mQQspBHPYzDxZ85c',
      );
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { ETHNFTGame, learner } = await loadFixture(deployProjectFixture);

      expect(await ETHNFTGame.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('getUserProjectInfo', function () {
    it("return NFT's image-URL and mint status of learner", async function () {
      const { ETHNFTGame, learner } = await loadFixture(deployProjectFixture);

      const textStatus = await ETHNFTGame.getUserProjectInfo(learner.address);

      expect(textStatus.passportHash).to.equal(
        'QmXrwaPtpgLmmJUq9Bgk9qgqHvbnz6mQQspBHPYzDxZ85c',
      );
      expect(textStatus.mintStatus).to.equal(0); // MintStatus.UNAVAILABLE
    });
  });

  describe('changeStatusToUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { ETHNFTGame, learner } = await loadFixture(deployProjectFixture);

      await ETHNFTGame.changeStatusToUnavailable(learner.address);

      expect(await ETHNFTGame.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { ETHNFTGame, learner } = await loadFixture(deployProjectFixture);

      await ETHNFTGame.changeStatusToAvailable(learner.address);

      expect(await ETHNFTGame.getUserMintStatus(learner.address)).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusToDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { ETHNFTGame, learner } = await loadFixture(deployProjectFixture);

      await ETHNFTGame.changeStatusToDone(learner.address);

      expect(await ETHNFTGame.getUserMintStatus(learner.address)).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { ETHNFTGame, learner } = await loadFixture(deployProjectFixture);

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ControlContract.
        await ETHNFTGame.changeStatusToAvailable(learner.address);

        await expect(ETHNFTGame.mint(learner.address))
          .to.emit(ETHNFTGame, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { ETHNFTGame, learner } = await loadFixture(deployProjectFixture);

        await expect(ETHNFTGame.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { ETHNFTGame, learner } = await loadFixture(deployProjectFixture);
        await ETHNFTGame.changeStatusToDone(learner.address);

        await expect(ETHNFTGame.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { ETHNFTGame, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(ETHNFTGame.mintByAdmin(owner.address, learner.address))
        .to.emit(ETHNFTGame, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { ETHNFTGame, learner } = await loadFixture(deployProjectFixture);
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ControlContract.
      await ETHNFTGame.changeStatusToAvailable(learner.address);
      await expect(ETHNFTGame.mint(learner.address))
        .to.emit(ETHNFTGame, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await ETHNFTGame.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: ETH NFT Game');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(
        'https://ipfs.io/ipfs/QmXrwaPtpgLmmJUq9Bgk9qgqHvbnz6mQQspBHPYzDxZ85c',
      );
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('ETH NFT Game');
    });
  });
});
