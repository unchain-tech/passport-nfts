// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('AVAX_Asset_Tokenization', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const AVAXAssetTokenizationFactory = await ethers.getContractFactory(
      'AVAX_Asset_Tokenization',
    );

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const AVAXAssetTokenization = await upgrades.deployProxy(
      AVAXAssetTokenizationFactory,
      [],
      {
        initializer: 'initialize',
      },
    );

    await AVAXAssetTokenization.deployed();

    return { AVAXAssetTokenization, owner, learner };
  }

  // Test case
  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { AVAXAssetTokenization } = await loadFixture(deployProjectFixture);

      expect(await AVAXAssetTokenization.getPassportHash()).to.equal(
        'QmZsLjNREsYjbYqYxhBzGdvK8oA4R241W9Y8MtymSNcuEk',
      );
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { AVAXAssetTokenization, learner } = await loadFixture(
        deployProjectFixture,
      );

      expect(
        await AVAXAssetTokenization.getUserMintStatus(learner.address),
      ).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { AVAXAssetTokenization, learner } = await loadFixture(
        deployProjectFixture,
      );

      await AVAXAssetTokenization.changeStatusToUnavailable(learner.address);

      expect(
        await AVAXAssetTokenization.getUserMintStatus(learner.address),
      ).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { AVAXAssetTokenization, learner } = await loadFixture(
        deployProjectFixture,
      );

      await AVAXAssetTokenization.changeStatusToAvailable(learner.address);

      expect(
        await AVAXAssetTokenization.getUserMintStatus(learner.address),
      ).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusToDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { AVAXAssetTokenization, learner } = await loadFixture(
        deployProjectFixture,
      );

      await AVAXAssetTokenization.changeStatusToDone(learner.address);

      expect(
        await AVAXAssetTokenization.getUserMintStatus(learner.address),
      ).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { AVAXAssetTokenization, learner } = await loadFixture(
          deployProjectFixture,
        );

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ProjectsController.
        await AVAXAssetTokenization.changeStatusToAvailable(learner.address);

        await expect(AVAXAssetTokenization.mint(learner.address))
          .to.emit(AVAXAssetTokenization, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { AVAXAssetTokenization, learner } = await loadFixture(
          deployProjectFixture,
        );

        await expect(
          AVAXAssetTokenization.mint(learner.address),
        ).to.be.revertedWith("you're mint status is not AVAILABLE!");
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { AVAXAssetTokenization, learner } = await loadFixture(
          deployProjectFixture,
        );
        await AVAXAssetTokenization.changeStatusToDone(learner.address);

        await expect(
          AVAXAssetTokenization.mint(learner.address),
        ).to.be.revertedWith("you're mint status is not AVAILABLE!");
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { AVAXAssetTokenization, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(
        AVAXAssetTokenization.mintByAdmin(owner.address, learner.address),
      )
        .to.emit(AVAXAssetTokenization, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { AVAXAssetTokenization, learner } = await loadFixture(
        deployProjectFixture,
      );
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ProjectsController.
      await AVAXAssetTokenization.changeStatusToAvailable(learner.address);
      await expect(AVAXAssetTokenization.mint(learner.address))
        .to.emit(AVAXAssetTokenization, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await AVAXAssetTokenization.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: AVAX Asset Tokenization');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(
        'https://ipfs.io/ipfs/QmZsLjNREsYjbYqYxhBzGdvK8oA4R241W9Y8MtymSNcuEk',
      );
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('AVAX Asset Tokenization');
    });
  });
});
