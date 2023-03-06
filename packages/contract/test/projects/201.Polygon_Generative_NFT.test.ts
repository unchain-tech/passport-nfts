// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('Polygon_Generative_NFT', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const PolygonGenerativeNFTFactory = await ethers.getContractFactory(
      'Polygon_Generative_NFT',
    );

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const PolygonGenerativeNFT = await upgrades.deployProxy(
      PolygonGenerativeNFTFactory,
      [],
      {
        initializer: 'initialize',
      },
    );

    await PolygonGenerativeNFT.deployed();

    return { PolygonGenerativeNFT, owner, learner };
  }

  // Test case
  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { PolygonGenerativeNFT } = await loadFixture(deployProjectFixture);

      expect(await PolygonGenerativeNFT.getPassportHash()).to.equal(
        'QmQW79bjqFwfeVY3TxrhFJh9WRen9mBTkL4vnntimPXqBw',
      );
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { PolygonGenerativeNFT, learner } = await loadFixture(
        deployProjectFixture,
      );

      expect(
        await PolygonGenerativeNFT.getUserMintStatus(learner.address),
      ).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { PolygonGenerativeNFT, learner } = await loadFixture(
        deployProjectFixture,
      );

      await PolygonGenerativeNFT.changeStatusToUnavailable(learner.address);

      expect(
        await PolygonGenerativeNFT.getUserMintStatus(learner.address),
      ).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { PolygonGenerativeNFT, learner } = await loadFixture(
        deployProjectFixture,
      );

      await PolygonGenerativeNFT.changeStatusToAvailable(learner.address);

      expect(
        await PolygonGenerativeNFT.getUserMintStatus(learner.address),
      ).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusToDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { PolygonGenerativeNFT, learner } = await loadFixture(
        deployProjectFixture,
      );

      await PolygonGenerativeNFT.changeStatusToDone(learner.address);

      expect(
        await PolygonGenerativeNFT.getUserMintStatus(learner.address),
      ).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { PolygonGenerativeNFT, learner } = await loadFixture(
          deployProjectFixture,
        );

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ProjectsController.
        await PolygonGenerativeNFT.changeStatusToAvailable(learner.address);

        await expect(PolygonGenerativeNFT.mint(learner.address))
          .to.emit(PolygonGenerativeNFT, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { PolygonGenerativeNFT, learner } = await loadFixture(
          deployProjectFixture,
        );

        await expect(
          PolygonGenerativeNFT.mint(learner.address),
        ).to.be.revertedWith("you're mint status is not AVAILABLE!");
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { PolygonGenerativeNFT, learner } = await loadFixture(
          deployProjectFixture,
        );
        await PolygonGenerativeNFT.changeStatusToDone(learner.address);

        await expect(
          PolygonGenerativeNFT.mint(learner.address),
        ).to.be.revertedWith("you're mint status is not AVAILABLE!");
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { PolygonGenerativeNFT, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(
        PolygonGenerativeNFT.mintByAdmin(owner.address, learner.address),
      )
        .to.emit(PolygonGenerativeNFT, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { PolygonGenerativeNFT, learner } = await loadFixture(
        deployProjectFixture,
      );
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ProjectsController.
      await PolygonGenerativeNFT.changeStatusToAvailable(learner.address);
      await expect(PolygonGenerativeNFT.mint(learner.address))
        .to.emit(PolygonGenerativeNFT, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await PolygonGenerativeNFT.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: Polygon Generative NFT');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(
        'https://ipfs.io/ipfs/QmQW79bjqFwfeVY3TxrhFJh9WRen9mBTkL4vnntimPXqBw',
      );
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('Polygon Generative NFT');
    });
  });
});
