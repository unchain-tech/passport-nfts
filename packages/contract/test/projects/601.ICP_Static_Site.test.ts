// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('ICP_Static_Site', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const ICPStaticSiteFactory = await ethers.getContractFactory(
      'ICP_Static_Site',
    );

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const ICPStaticSite = await upgrades.deployProxy(ICPStaticSiteFactory, [], {
      initializer: 'initialize',
    });

    await ICPStaticSite.deployed();

    return { ICPStaticSite, owner, learner };
  }

  // Test case
  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { ICPStaticSite } = await loadFixture(deployProjectFixture);

      expect(await ICPStaticSite.getPassportHash()).to.equal(
        'QmeCP9NaqBKPJroZMCGaMnd73zXPcEKrUPDFHSWfuaYkYv',
      );
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { ICPStaticSite, learner } = await loadFixture(
        deployProjectFixture,
      );

      expect(await ICPStaticSite.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('getUserProjectInfo', function () {
    it("return NFT's image-URL and mint status of learner", async function () {
      const { ICPStaticSite, learner } = await loadFixture(
        deployProjectFixture,
      );

      const textStatus = await ICPStaticSite.getUserProjectInfo(
        learner.address,
      );

      expect(textStatus.passportHash).to.equal(
        'QmeCP9NaqBKPJroZMCGaMnd73zXPcEKrUPDFHSWfuaYkYv',
      );
      expect(textStatus.mintStatus).to.equal(0); // MintStatus.UNAVAILABLE
    });
  });

  describe('changeStatusUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { ICPStaticSite, learner } = await loadFixture(
        deployProjectFixture,
      );

      await ICPStaticSite.changeStatusUnavailable(learner.address);

      expect(await ICPStaticSite.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { ICPStaticSite, learner } = await loadFixture(
        deployProjectFixture,
      );

      await ICPStaticSite.changeStatusAvailable(learner.address);

      expect(await ICPStaticSite.getUserMintStatus(learner.address)).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { ICPStaticSite, learner } = await loadFixture(
        deployProjectFixture,
      );

      await ICPStaticSite.changeStatusDone(learner.address);

      expect(await ICPStaticSite.getUserMintStatus(learner.address)).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { ICPStaticSite, learner } = await loadFixture(
          deployProjectFixture,
        );

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ControlContract.
        await ICPStaticSite.changeStatusAvailable(learner.address);

        await expect(ICPStaticSite.mint(learner.address))
          .to.emit(ICPStaticSite, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { ICPStaticSite, learner } = await loadFixture(
          deployProjectFixture,
        );

        await expect(ICPStaticSite.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { ICPStaticSite, learner } = await loadFixture(
          deployProjectFixture,
        );
        await ICPStaticSite.changeStatusDone(learner.address);

        await expect(ICPStaticSite.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { ICPStaticSite, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(ICPStaticSite.mintByAdmin(owner.address, learner.address))
        .to.emit(ICPStaticSite, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { ICPStaticSite, learner } = await loadFixture(
        deployProjectFixture,
      );
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ControlContract.
      await ICPStaticSite.changeStatusAvailable(learner.address);
      await expect(ICPStaticSite.mint(learner.address))
        .to.emit(ICPStaticSite, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await ICPStaticSite.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: ICP Static Site');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(
        'https://ipfs.io/ipfs/QmeCP9NaqBKPJroZMCGaMnd73zXPcEKrUPDFHSWfuaYkYv',
      );
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('ICP Static Site');
    });
  });
});
