// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('ETH_NFT_Collection', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const ETHNFTCollectionFactory = await ethers.getContractFactory(
      'ETH_NFT_Collection',
    );

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const ETHNFTCollection = await upgrades.deployProxy(
      ETHNFTCollectionFactory,
      [],
      {
        initializer: 'initialize',
      },
    );

    await ETHNFTCollection.deployed();

    return { ETHNFTCollection, owner, learner };
  }

  // Test case
  describe('getProjectName', function () {
    it('return project name', async function () {
      const { ETHNFTCollection } = await loadFixture(deployProjectFixture);

      expect(await ETHNFTCollection.getProjectName()).to.equal(
        'ETH NFT Collection',
      );
    });
  });

  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { ETHNFTCollection } = await loadFixture(deployProjectFixture);

      expect(await ETHNFTCollection.getPassportHash()).to.equal(
        'QmbboPHPWPn7Fm9ULTKppC4AkeLGG8SimEPXgCM3Hr5eWN',
      );
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { ETHNFTCollection, learner } = await loadFixture(
        deployProjectFixture,
      );

      expect(
        await ETHNFTCollection.getUserMintStatus(learner.address),
      ).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { ETHNFTCollection, learner } = await loadFixture(
        deployProjectFixture,
      );

      await ETHNFTCollection.changeStatusToUnavailable(learner.address);

      expect(
        await ETHNFTCollection.getUserMintStatus(learner.address),
      ).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { ETHNFTCollection, learner } = await loadFixture(
        deployProjectFixture,
      );

      await ETHNFTCollection.changeStatusToAvailable(learner.address);

      expect(
        await ETHNFTCollection.getUserMintStatus(learner.address),
      ).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusToDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { ETHNFTCollection, learner } = await loadFixture(
        deployProjectFixture,
      );

      await ETHNFTCollection.changeStatusToDone(learner.address);

      expect(
        await ETHNFTCollection.getUserMintStatus(learner.address),
      ).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { ETHNFTCollection, learner } = await loadFixture(
          deployProjectFixture,
        );

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ProjectsController.
        await ETHNFTCollection.changeStatusToAvailable(learner.address);

        await expect(ETHNFTCollection.mint(learner.address))
          .to.emit(ETHNFTCollection, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { ETHNFTCollection, learner } = await loadFixture(
          deployProjectFixture,
        );

        await expect(ETHNFTCollection.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { ETHNFTCollection, learner } = await loadFixture(
          deployProjectFixture,
        );
        await ETHNFTCollection.changeStatusToDone(learner.address);

        await expect(ETHNFTCollection.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { ETHNFTCollection, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(ETHNFTCollection.mintByAdmin(owner.address, learner.address))
        .to.emit(ETHNFTCollection, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { ETHNFTCollection, learner } = await loadFixture(
        deployProjectFixture,
      );
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ProjectsController.
      await ETHNFTCollection.changeStatusToAvailable(learner.address);
      await expect(ETHNFTCollection.mint(learner.address))
        .to.emit(ETHNFTCollection, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await ETHNFTCollection.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: ETH NFT Collection');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(
        'https://ipfs.io/ipfs/QmbboPHPWPn7Fm9ULTKppC4AkeLGG8SimEPXgCM3Hr5eWN',
      );
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('ETH NFT Collection');
    });
  });
});
