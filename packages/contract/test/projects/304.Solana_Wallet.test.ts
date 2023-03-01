// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('Solana_Wallet', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const SolanaWalletFactory = await ethers.getContractFactory(
      'Solana_Wallet',
    );

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const SolanaWallet = await upgrades.deployProxy(SolanaWalletFactory, [], {
      initializer: 'initialize',
    });

    await SolanaWallet.deployed();

    return { SolanaWallet, owner, learner };
  }

  // Test case
  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { SolanaWallet } = await loadFixture(deployProjectFixture);

      expect(await SolanaWallet.getPassportHash()).to.equal(
        'QmXjWn9oRRzE4XkxCWM3XokWKJqkghkZmg8ox2w87pB2n9',
      );
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { SolanaWallet, learner } = await loadFixture(deployProjectFixture);

      expect(await SolanaWallet.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('getUserProjectInfo', function () {
    it("return NFT's image-URL and mint status of learner", async function () {
      const { SolanaWallet, learner } = await loadFixture(deployProjectFixture);

      const textStatus = await SolanaWallet.getUserProjectInfo(learner.address);

      expect(textStatus.passportHash).to.equal(
        'QmXjWn9oRRzE4XkxCWM3XokWKJqkghkZmg8ox2w87pB2n9',
      );
      expect(textStatus.mintStatus).to.equal(0); // MintStatus.UNAVAILABLE
    });
  });

  describe('changeStatusUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { SolanaWallet, learner } = await loadFixture(deployProjectFixture);

      await SolanaWallet.changeStatusUnavailable(learner.address);

      expect(await SolanaWallet.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { SolanaWallet, learner } = await loadFixture(deployProjectFixture);

      await SolanaWallet.changeStatusAvailable(learner.address);

      expect(await SolanaWallet.getUserMintStatus(learner.address)).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { SolanaWallet, learner } = await loadFixture(deployProjectFixture);

      await SolanaWallet.changeStatusDone(learner.address);

      expect(await SolanaWallet.getUserMintStatus(learner.address)).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { SolanaWallet, learner } = await loadFixture(
          deployProjectFixture,
        );

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ControlContract.
        await SolanaWallet.changeStatusAvailable(learner.address);

        await expect(SolanaWallet.mint(learner.address))
          .to.emit(SolanaWallet, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { SolanaWallet, learner } = await loadFixture(
          deployProjectFixture,
        );

        await expect(SolanaWallet.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { SolanaWallet, learner } = await loadFixture(
          deployProjectFixture,
        );
        await SolanaWallet.changeStatusDone(learner.address);

        await expect(SolanaWallet.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { SolanaWallet, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(SolanaWallet.mintByAdmin(owner.address, learner.address))
        .to.emit(SolanaWallet, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { SolanaWallet, learner } = await loadFixture(deployProjectFixture);
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ControlContract.
      await SolanaWallet.changeStatusAvailable(learner.address);
      await expect(SolanaWallet.mint(learner.address))
        .to.emit(SolanaWallet, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await SolanaWallet.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: Solana Wallet');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(
        'https://ipfs.io/ipfs/QmXjWn9oRRzE4XkxCWM3XokWKJqkghkZmg8ox2w87pB2n9',
      );
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('Solana Wallet');
    });
  });
});
