// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('Polygon_Mobile_dApp', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const PolygonMobiledAppFactory = await ethers.getContractFactory(
      'Polygon_Mobile_dApp',
    );

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();
    // Define a private variable from the contract for testing
    const passportHash = 'QmXCY8H6XaHcd6cftYV9fKE7xpQXwpH2eWBv2pjnL9TBbs';

    const PolygonMobiledApp = await upgrades.deployProxy(
      PolygonMobiledAppFactory,
      [],
      {
        initializer: 'initialize',
      },
    );

    await PolygonMobiledApp.deployed();

    return { PolygonMobiledApp, owner, learner, passportHash };
  }

  // Test case
  describe('getProjectName', function () {
    it('return project name', async function () {
      const { PolygonMobiledApp } = await loadFixture(deployProjectFixture);

      expect(await PolygonMobiledApp.getProjectName()).to.equal(
        'Polygon Mobile dApp',
      );
    });
  });

  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { PolygonMobiledApp, passportHash } = await loadFixture(
        deployProjectFixture,
      );

      expect(await PolygonMobiledApp.getPassportHash()).to.equal(passportHash);
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { PolygonMobiledApp, learner } = await loadFixture(
        deployProjectFixture,
      );

      expect(
        await PolygonMobiledApp.getUserMintStatus(learner.address),
      ).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { PolygonMobiledApp, learner } = await loadFixture(
        deployProjectFixture,
      );

      await PolygonMobiledApp.changeStatusToUnavailable(learner.address);

      expect(
        await PolygonMobiledApp.getUserMintStatus(learner.address),
      ).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { PolygonMobiledApp, learner } = await loadFixture(
        deployProjectFixture,
      );

      await PolygonMobiledApp.changeStatusToAvailable(learner.address);

      expect(
        await PolygonMobiledApp.getUserMintStatus(learner.address),
      ).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusToDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { PolygonMobiledApp, learner } = await loadFixture(
        deployProjectFixture,
      );

      await PolygonMobiledApp.changeStatusToDone(learner.address);

      expect(
        await PolygonMobiledApp.getUserMintStatus(learner.address),
      ).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { PolygonMobiledApp, learner } = await loadFixture(
          deployProjectFixture,
        );

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ProjectsController.
        await PolygonMobiledApp.changeStatusToAvailable(learner.address);

        await expect(PolygonMobiledApp.mint(learner.address))
          .to.emit(PolygonMobiledApp, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { PolygonMobiledApp, learner } = await loadFixture(
          deployProjectFixture,
        );

        await expect(
          PolygonMobiledApp.mint(learner.address),
        ).to.be.revertedWith("you're mint status is not AVAILABLE!");
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { PolygonMobiledApp, learner } = await loadFixture(
          deployProjectFixture,
        );
        await PolygonMobiledApp.changeStatusToDone(learner.address);

        await expect(
          PolygonMobiledApp.mint(learner.address),
        ).to.be.revertedWith("you're mint status is not AVAILABLE!");
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { PolygonMobiledApp, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(
        PolygonMobiledApp.mintByAdmin(owner.address, learner.address),
      )
        .to.emit(PolygonMobiledApp, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { PolygonMobiledApp, learner, passportHash } = await loadFixture(
        deployProjectFixture,
      );
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ProjectsController.
      await PolygonMobiledApp.changeStatusToAvailable(learner.address);
      await expect(PolygonMobiledApp.mint(learner.address))
        .to.emit(PolygonMobiledApp, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await PolygonMobiledApp.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: Polygon Mobile dApp');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(`https://ipfs.io/ipfs/${passportHash}`);
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('Polygon Mobile dApp');
    });
  });
});
