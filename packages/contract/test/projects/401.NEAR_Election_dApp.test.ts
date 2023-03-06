// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('NEAR_Election_dApp', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const NEARElectionDappFactory = await ethers.getContractFactory(
      'NEAR_Election_dApp',
    );

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const NEARElectionDapp = await upgrades.deployProxy(
      NEARElectionDappFactory,
      [],
      {
        initializer: 'initialize',
      },
    );

    await NEARElectionDapp.deployed();

    return { NEARElectionDapp, owner, learner };
  }

  // Test case
  describe('getProjectName', function () {
    it('return project name', async function () {
      const { NEARElectionDapp } = await loadFixture(deployProjectFixture);

      expect(await NEARElectionDapp.getProjectName()).to.equal(
        'NEAR Election dApp',
      );
    });
  });

  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { NEARElectionDapp } = await loadFixture(deployProjectFixture);

      expect(await NEARElectionDapp.getPassportHash()).to.equal(
        'QmYK1uqMzqtgpEi5MqWqdAMemoopSKf2rswKjhR2w3wBNH',
      );
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { NEARElectionDapp, learner } = await loadFixture(
        deployProjectFixture,
      );

      expect(
        await NEARElectionDapp.getUserMintStatus(learner.address),
      ).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { NEARElectionDapp, learner } = await loadFixture(
        deployProjectFixture,
      );

      await NEARElectionDapp.changeStatusToUnavailable(learner.address);

      expect(
        await NEARElectionDapp.getUserMintStatus(learner.address),
      ).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { NEARElectionDapp, learner } = await loadFixture(
        deployProjectFixture,
      );

      await NEARElectionDapp.changeStatusToAvailable(learner.address);

      expect(
        await NEARElectionDapp.getUserMintStatus(learner.address),
      ).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusToDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { NEARElectionDapp, learner } = await loadFixture(
        deployProjectFixture,
      );

      await NEARElectionDapp.changeStatusToDone(learner.address);

      expect(
        await NEARElectionDapp.getUserMintStatus(learner.address),
      ).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { NEARElectionDapp, learner } = await loadFixture(
          deployProjectFixture,
        );

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ProjectsController.
        await NEARElectionDapp.changeStatusToAvailable(learner.address);

        await expect(NEARElectionDapp.mint(learner.address))
          .to.emit(NEARElectionDapp, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { NEARElectionDapp, learner } = await loadFixture(
          deployProjectFixture,
        );

        await expect(NEARElectionDapp.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { NEARElectionDapp, learner } = await loadFixture(
          deployProjectFixture,
        );
        await NEARElectionDapp.changeStatusToDone(learner.address);

        await expect(NEARElectionDapp.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { NEARElectionDapp, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(NEARElectionDapp.mintByAdmin(owner.address, learner.address))
        .to.emit(NEARElectionDapp, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { NEARElectionDapp, learner } = await loadFixture(
        deployProjectFixture,
      );
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ProjectsController.
      await NEARElectionDapp.changeStatusToAvailable(learner.address);
      await expect(NEARElectionDapp.mint(learner.address))
        .to.emit(NEARElectionDapp, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await NEARElectionDapp.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: NEAR Election dApp');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(
        'https://ipfs.io/ipfs/QmYK1uqMzqtgpEi5MqWqdAMemoopSKf2rswKjhR2w3wBNH',
      );
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('NEAR Election dApp');
    });
  });
});
