// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('ETH_Yield_Farm', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const ETHYieldFarmFactory = await ethers.getContractFactory(
      'ETH_Yield_Farm',
    );

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const ETHYieldFarm = await upgrades.deployProxy(ETHYieldFarmFactory, [], {
      initializer: 'initialize',
    });

    await ETHYieldFarm.deployed();

    return { ETHYieldFarm, owner, learner };
  }

  // Test case
  describe('getProjectName', function () {
    it('return project name', async function () {
      const { ETHYieldFarm } = await loadFixture(deployProjectFixture);

      expect(await ETHYieldFarm.getProjectName()).to.equal('ETH Yield Farm');
    });
  });

  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { ETHYieldFarm } = await loadFixture(deployProjectFixture);

      expect(await ETHYieldFarm.getPassportHash()).to.equal(
        'QmcKaf9bLvMAzjAwYXwAQTaQVvtkffFKfpBRpGgBP71c1p',
      );
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { ETHYieldFarm, learner } = await loadFixture(deployProjectFixture);

      expect(await ETHYieldFarm.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { ETHYieldFarm, learner } = await loadFixture(deployProjectFixture);

      await ETHYieldFarm.changeStatusToUnavailable(learner.address);

      expect(await ETHYieldFarm.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { ETHYieldFarm, learner } = await loadFixture(deployProjectFixture);

      await ETHYieldFarm.changeStatusToAvailable(learner.address);

      expect(await ETHYieldFarm.getUserMintStatus(learner.address)).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusToDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { ETHYieldFarm, learner } = await loadFixture(deployProjectFixture);

      await ETHYieldFarm.changeStatusToDone(learner.address);

      expect(await ETHYieldFarm.getUserMintStatus(learner.address)).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { ETHYieldFarm, learner } = await loadFixture(
          deployProjectFixture,
        );

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ProjectsController.
        await ETHYieldFarm.changeStatusToAvailable(learner.address);

        await expect(ETHYieldFarm.mint(learner.address))
          .to.emit(ETHYieldFarm, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { ETHYieldFarm, learner } = await loadFixture(
          deployProjectFixture,
        );

        await expect(ETHYieldFarm.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { ETHYieldFarm, learner } = await loadFixture(
          deployProjectFixture,
        );
        await ETHYieldFarm.changeStatusToDone(learner.address);

        await expect(ETHYieldFarm.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { ETHYieldFarm, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(ETHYieldFarm.mintByAdmin(owner.address, learner.address))
        .to.emit(ETHYieldFarm, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { ETHYieldFarm, learner } = await loadFixture(deployProjectFixture);
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ProjectsController.
      await ETHYieldFarm.changeStatusToAvailable(learner.address);
      await expect(ETHYieldFarm.mint(learner.address))
        .to.emit(ETHYieldFarm, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await ETHYieldFarm.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: ETH Yield Farm');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(
        'https://ipfs.io/ipfs/QmcKaf9bLvMAzjAwYXwAQTaQVvtkffFKfpBRpGgBP71c1p',
      );
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('ETH Yield Farm');
    });
  });
});