// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('AVAX_Subnet', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const AVAXSubnetFactory = await ethers.getContractFactory('AVAX_Subnet');

    // Contracts are deployed using the first signer/account by default
    const [owner, learner] = await ethers.getSigners();

    const AVAXSubnet = await upgrades.deployProxy(AVAXSubnetFactory, [], {
      initializer: 'initialize',
    });

    await AVAXSubnet.deployed();

    return { AVAXSubnet, owner, learner };
  }

  // Test case
  describe('getPassportHash', function () {
    it('return passportHash', async function () {
      const { AVAXSubnet } = await loadFixture(deployProjectFixture);

      // TODO: Set hash value.
      expect(await AVAXSubnet.getPassportHash()).to.equal('');
    });
  });

  describe('getUserMintStatus', function () {
    it("return default status 'UNAVAILABLE' of the learner", async function () {
      const { AVAXSubnet, learner } = await loadFixture(deployProjectFixture);

      expect(await AVAXSubnet.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('getUserProjectInfo', function () {
    it("return NFT's image-URL and mint status of learner", async function () {
      const { AVAXSubnet, learner } = await loadFixture(deployProjectFixture);

      const textStatus = await AVAXSubnet.getUserProjectInfo(learner.address);

      // TODO: Set hash value.
      expect(textStatus.passportHash).to.equal('');
      expect(textStatus.mintStatus).to.equal(0); // MintStatus.UNAVAILABLE
    });
  });

  describe('changeStatusToUnavailable', function () {
    it("change learner's mint status to UNAVAILABLE", async function () {
      const { AVAXSubnet, learner } = await loadFixture(deployProjectFixture);

      await AVAXSubnet.changeStatusToUnavailable(learner.address);

      expect(await AVAXSubnet.getUserMintStatus(learner.address)).to.equal(
        0, // MintStatus.UNAVAILABLE
      );
    });
  });

  describe('changeStatusToAvailable', function () {
    it("change learner's mint status to AVAILABLE", async function () {
      const { AVAXSubnet, learner } = await loadFixture(deployProjectFixture);

      await AVAXSubnet.changeStatusToAvailable(learner.address);

      expect(await AVAXSubnet.getUserMintStatus(learner.address)).to.equal(
        1, // MintStatus.AVAILABLE
      );
    });
  });

  describe('changeStatusToDone', function () {
    it("change learner's mint status to DONE", async function () {
      const { AVAXSubnet, learner } = await loadFixture(deployProjectFixture);

      await AVAXSubnet.changeStatusToDone(learner.address);

      expect(await AVAXSubnet.getUserMintStatus(learner.address)).to.equal(
        2, // MintStatus.DONE
      );
    });
  });

  describe('mint', function () {
    context("when learner's mint status is AVAILABLE", function () {
      it('emit a NewTokenMinted event', async function () {
        const { AVAXSubnet, learner } = await loadFixture(deployProjectFixture);

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ControlContract.
        await AVAXSubnet.changeStatusToAvailable(learner.address);

        await expect(AVAXSubnet.mint(learner.address))
          .to.emit(AVAXSubnet, 'NewTokenMinted')
          .withArgs(learner.address, learner.address, 1);
      });
    });

    context("when learner's mint status is UNAVAILABLE", function () {
      it('reverts', async function () {
        const { AVAXSubnet, learner } = await loadFixture(deployProjectFixture);

        await expect(AVAXSubnet.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });

    context("when learner's mint status is DONE", function () {
      it('reverts', async function () {
        const { AVAXSubnet, learner } = await loadFixture(deployProjectFixture);
        await AVAXSubnet.changeStatusToDone(learner.address);

        await expect(AVAXSubnet.mint(learner.address)).to.be.revertedWith(
          "you're mint status is not AVAILABLE!",
        );
      });
    });
  });

  describe('mintByAdmin', function () {
    it('emit a NewTokenMinted event', async function () {
      const { AVAXSubnet, owner, learner } = await loadFixture(
        deployProjectFixture,
      );

      await expect(AVAXSubnet.mintByAdmin(owner.address, learner.address))
        .to.emit(AVAXSubnet, 'NewTokenMinted')
        .withArgs(owner.address, learner.address, 1);
    });
  });

  describe('tokenURI', function () {
    it('should get a token URI', async function () {
      /** Arrange */
      const { AVAXSubnet, learner } = await loadFixture(deployProjectFixture);
      const tokenId = 1;

      // NOTE: In practice, the mint status is changed by a user
      // with the Controller-Role calling from ControlContract.
      await AVAXSubnet.changeStatusToAvailable(learner.address);
      await expect(AVAXSubnet.mint(learner.address))
        .to.emit(AVAXSubnet, 'NewTokenMinted')
        .withArgs(learner.address, learner.address, tokenId);

      /** Act */
      const getTokenURI = await AVAXSubnet.tokenURI(tokenId);

      /** Assert */
      // 29 = length of "data:application/json;base64,"
      const json = atob(getTokenURI.substring(29));
      const object = JSON.parse(json);
      expect(object.name).to.equal('UNCHAIN Passport: AVAX Subnet');
      expect(object.description).to.equal(
        'Immutable and permanent proof of your UNCHAIN project completion.',
      );
      // TODO: Set hash value.
      expect(object.image).to.equal('https://ipfs.io/ipfs/');
      expect(object.attributes[0].trait_type).to.equal('UNCHAIN Project');
      expect(object.attributes[0].value).to.equal('AVAX Subnet');
    });
  });
});
