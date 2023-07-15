// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('Solana_Online_Store', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const SolanaOnlineStoreFactory = await ethers.getContractFactory(
      'Solana_Online_Store',
    );

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();
    // Define a private variable from the contract for testing
    const passportHash = 'QmQb3MxagMvtJoYw4qjmnpAwztkcAMXh2ohSRKtk1CSRP5';

    const SolanaOnlineStore = await upgrades.deployProxy(
      SolanaOnlineStoreFactory,
      [],
      {
        initializer: 'initialize',
      },
    );

    await SolanaOnlineStore.deployed();

    return { SolanaOnlineStore, owner, learner, passportHash };
  }

  // Test case
  describe('getProjectName', function () {
    it('return project name', async function () {
      const { SolanaOnlineStore } = await loadFixture(deployProjectFixture);

      expect(await SolanaOnlineStore.getProjectName()).to.equal(
        'Solana Online Store',
      );
    });
  });

  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { SolanaOnlineStore, passportHash } = await loadFixture(
        deployProjectFixture,
      );

      expect(await SolanaOnlineStore.getPassportHash()).to.equal(passportHash);
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { SolanaOnlineStore, learner } = await loadFixture(
        deployProjectFixture,
      );

      expect(
        await SolanaOnlineStore.getUserMintStatus(learner.address),
      ).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { SolanaOnlineStore, learner } = await loadFixture(
        deployProjectFixture,
      );

      await SolanaOnlineStore.changeStatusToUnavailable(learner.address);

      expect(
        await SolanaOnlineStore.getUserMintStatus(learner.address),
      ).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { SolanaOnlineStore, learner } = await loadFixture(
        deployProjectFixture,
      );

      await SolanaOnlineStore.changeStatusToAvailable(learner.address);

      expect(
        await SolanaOnlineStore.getUserMintStatus(learner.address),
      ).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusToDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { SolanaOnlineStore, learner } = await loadFixture(
        deployProjectFixture,
      );

      await SolanaOnlineStore.changeStatusToDone(learner.address);

      expect(
        await SolanaOnlineStore.getUserMintStatus(learner.address),
      ).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { SolanaOnlineStore, learner } = await loadFixture(
          deployProjectFixture,
        );

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ProjectsController.
        await SolanaOnlineStore.changeStatusToAvailable(learner.address);

        await expect(SolanaOnlineStore.mint(learner.address))
          .to.emit(SolanaOnlineStore, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { SolanaOnlineStore, learner } = await loadFixture(
          deployProjectFixture,
        );

        await expect(
          SolanaOnlineStore.mint(learner.address),
        ).to.be.revertedWith("you're mint status is not AVAILABLE!");
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { SolanaOnlineStore, learner } = await loadFixture(
          deployProjectFixture,
        );
        await SolanaOnlineStore.changeStatusToDone(learner.address);

        await expect(
          SolanaOnlineStore.mint(learner.address),
        ).to.be.revertedWith("you're mint status is not AVAILABLE!");
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { SolanaOnlineStore, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(
        SolanaOnlineStore.mintByAdmin(owner.address, learner.address),
      )
        .to.emit(SolanaOnlineStore, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { SolanaOnlineStore, learner, passportHash } = await loadFixture(
        deployProjectFixture,
      );
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ProjectsController.
      await SolanaOnlineStore.changeStatusToAvailable(learner.address);
      await expect(SolanaOnlineStore.mint(learner.address))
        .to.emit(SolanaOnlineStore, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await SolanaOnlineStore.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: Solana Online Store');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(`https://ipfs.io/ipfs/${passportHash}`);
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('Solana Online Store');
    });
  });
});
