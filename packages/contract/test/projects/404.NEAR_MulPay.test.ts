// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('NEAR_MulPay', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const NEARMulPayFactory = await ethers.getContractFactory('NEAR_MulPay');

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const NEARMulPay = await upgrades.deployProxy(NEARMulPayFactory, [], {
      initializer: 'initialize',
    });

    await NEARMulPay.deployed();

    return { NEARMulPay, owner, learner };
  }

  // Test case
  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { NEARMulPay } = await loadFixture(deployProjectFixture);

      expect(await NEARMulPay.getPassportHash()).to.equal(
        'QmPGi1a3KgSyop4rj2oaYdd9x7cbMXj9VMunQNSykzd5ds',
      );
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { NEARMulPay, learner } = await loadFixture(deployProjectFixture);

      expect(await NEARMulPay.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('getUserProjectInfo', function () {
    it("return NFT's image-URL and mint status of learner", async function () {
      const { NEARMulPay, learner } = await loadFixture(deployProjectFixture);

      const textStatus = await NEARMulPay.getUserProjectInfo(learner.address);

      expect(textStatus.passportHash).to.equal(
        'QmPGi1a3KgSyop4rj2oaYdd9x7cbMXj9VMunQNSykzd5ds',
      );
      expect(textStatus.mintStatus).to.equal(0); // MintStatus.UNAVAILABLE
    });
  });

  describe('changeStatusToUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { NEARMulPay, learner } = await loadFixture(deployProjectFixture);

      await NEARMulPay.changeStatusToUnavailable(learner.address);

      expect(await NEARMulPay.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { NEARMulPay, learner } = await loadFixture(deployProjectFixture);

      await NEARMulPay.changeStatusToAvailable(learner.address);

      expect(await NEARMulPay.getUserMintStatus(learner.address)).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusToDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { NEARMulPay, learner } = await loadFixture(deployProjectFixture);

      await NEARMulPay.changeStatusToDone(learner.address);

      expect(await NEARMulPay.getUserMintStatus(learner.address)).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { NEARMulPay, learner } = await loadFixture(deployProjectFixture);

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ControlContract.
        await NEARMulPay.changeStatusToAvailable(learner.address);

        await expect(NEARMulPay.mint(learner.address))
          .to.emit(NEARMulPay, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { NEARMulPay, learner } = await loadFixture(deployProjectFixture);

        await expect(NEARMulPay.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { NEARMulPay, learner } = await loadFixture(deployProjectFixture);
        await NEARMulPay.changeStatusToDone(learner.address);

        await expect(NEARMulPay.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { NEARMulPay, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(NEARMulPay.mintByAdmin(owner.address, learner.address))
        .to.emit(NEARMulPay, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { NEARMulPay, learner } = await loadFixture(deployProjectFixture);
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ControlContract.
      await NEARMulPay.changeStatusToAvailable(learner.address);
      await expect(NEARMulPay.mint(learner.address))
        .to.emit(NEARMulPay, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await NEARMulPay.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: NEAR MulPay');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      expect(object.image).to.equal(
        'https://ipfs.io/ipfs/QmPGi1a3KgSyop4rj2oaYdd9x7cbMXj9VMunQNSykzd5ds',
      );
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('NEAR MulPay');
    });
  });
});
