// Load dependencies
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('Control Contract AccessControl', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployTextFixture() {
    const ControlContractFactory = await ethers.getContractFactory(
      'ControlContract',
    );
    const TextContractFactory = await ethers.getContractFactory('TextContract');

    // Contracts are deployed using the first signer/account by default
    const [owner, controller, learner] = await ethers.getSigners();

    const controlContract = await upgrades.deployProxy(
      ControlContractFactory,
      [],
      {
        initializer: 'initialize',
      },
    );
    const textContract = await upgrades.deployProxy(TextContractFactory, [], {
      initializer: 'initialize',
    });

    await controlContract.deployed();
    await textContract.deployed();

    // setup role
    const ADMIN_ROLE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes('ADMIN_ROLE'),
    );
    const CONTROLLER_ROLE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes('CONTROLLER_ROLE'),
    );

    return {
      controlContract,
      textContract,
      owner,
      controller,
      learner,
      ADMIN_ROLE,
      CONTROLLER_ROLE,
    };
  }

  // Test case
  // ===== hasRole =====
  it('Contract owner should have ADMIN_ROLE', async function () {
    const { controlContract, owner, ADMIN_ROLE } = await loadFixture(
      deployTextFixture,
    );

    const isAdmin = await controlContract.hasRole(ADMIN_ROLE, owner.address);
    expect(isAdmin).to.equal(true);
  });

  it('Contract owner should have CONTROLLER_ROLE', async function () {
    const { controlContract, owner, CONTROLLER_ROLE } = await loadFixture(
      deployTextFixture,
    );

    const isController = await controlContract.hasRole(
      CONTROLLER_ROLE,
      owner.address,
    );
    expect(isController).to.equal(true);
  });

  // ===== grant =====
  it('Contract owner should be able to grant the CONTROLLER_ROLE', async function () {
    const { controlContract, controller, CONTROLLER_ROLE } = await loadFixture(
      deployTextFixture,
    );

    // grant CONTROLLER_ROLE to controller
    await controlContract.grantControllerRole(controller.address);

    const isController = await controlContract.hasRole(
      CONTROLLER_ROLE,
      controller.address,
    );
    expect(isController).to.equal(true);
  });

  // ===== onlyRole =====
  context('Users without ADMIN_ROLE', function () {
    describe('grantControllerRole', function () {
      it('Should fail if user does not have ADMIN_ROLE', async function () {
        // controller hasn't ADMIN_ROLE
        const { controlContract, controller, learner, ADMIN_ROLE } =
          await loadFixture(deployTextFixture);

        await expect(
          controlContract
            .connect(controller)
            .grantControllerRole(learner.address),
        ).to.be.revertedWith(
          `AccessControl: account ${controller.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });
    });

    describe('multiMint', function () {
      it('Should fail if user does not have ADMIN_ROLE', async function () {
        // controller hasn't ADMIN_ROLE
        const {
          controlContract,
          textContract,
          controller,
          learner,
          ADMIN_ROLE,
        } = await loadFixture(deployTextFixture);

        const recipients = [learner.address];
        const contractAddresses = [textContract.address];

        await expect(
          controlContract
            .connect(controller)
            .multiMint(recipients, contractAddresses),
        ).to.be.revertedWith(
          `AccessControl: account ${controller.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });
    });
  });

  context('Users without CONTROLLER_ROLE', function () {
    describe('addTextContractAddress', function () {
      it('Should fail if user does not have CONTROLLER_ROLE', async function () {
        // learner hasn't CONTROLLER_ROLE
        const { controlContract, textContract, learner, CONTROLLER_ROLE } =
          await loadFixture(deployTextFixture);

        await expect(
          controlContract
            .connect(learner)
            .addTextContractAddress(textContract.address),
        ).to.be.revertedWith(
          `AccessControl: account ${learner.address.toLowerCase()} is missing role ${CONTROLLER_ROLE}`,
        );
      });
    });

    describe('showTextContractAddressList', function () {
      it('Should fail if user does not have CONTROLLER_ROLE', async function () {
        // learner hasn't CONTROLLER_ROLE
        const { controlContract, learner, CONTROLLER_ROLE } = await loadFixture(
          deployTextFixture,
        );

        await expect(
          controlContract.connect(learner).showTextContractAddressList(),
        ).to.be.revertedWith(
          `AccessControl: account ${learner.address.toLowerCase()} is missing role ${CONTROLLER_ROLE}`,
        );
      });
    });

    describe('getTexts', function () {
      it('Should fail if user does not have CONTROLLER_ROLE', async function () {
        // learner hasn't CONTROLLER_ROLE
        const { controlContract, textContract, learner, CONTROLLER_ROLE } =
          await loadFixture(deployTextFixture);

        await expect(
          controlContract
            .connect(learner)
            .getTexts([textContract.address], learner.address),
        ).to.be.revertedWith(
          `AccessControl: account ${learner.address.toLowerCase()} is missing role ${CONTROLLER_ROLE}`,
        );
      });
    });

    describe('getStatus', function () {
      it('Should fail if user does not have CONTROLLER_ROLE', async function () {
        // learner hasn't CONTROLLER_ROLE
        const { controlContract, textContract, learner, CONTROLLER_ROLE } =
          await loadFixture(deployTextFixture);

        await expect(
          controlContract
            .connect(learner)
            .getStatus(textContract.address, learner.address),
        ).to.be.revertedWith(
          `AccessControl: account ${learner.address.toLowerCase()} is missing role ${CONTROLLER_ROLE}`,
        );
      });
    });

    describe('changeStatusUnavailable', function () {
      it('Should fail if user does not have CONTROLLER_ROLE', async function () {
        // learner hasn't CONTROLLER_ROLE
        const { controlContract, textContract, learner, CONTROLLER_ROLE } =
          await loadFixture(deployTextFixture);

        await expect(
          controlContract
            .connect(learner)
            .changeStatusUnavailable(textContract.address, learner.address),
        ).to.be.revertedWith(
          `AccessControl: account ${learner.address.toLowerCase()} is missing role ${CONTROLLER_ROLE}`,
        );
      });
    });

    describe('changeStatusAvailable', function () {
      it('Should fail if user does not have CONTROLLER_ROLE', async function () {
        // learner hasn't CONTROLLER_ROLE
        const { controlContract, textContract, learner, CONTROLLER_ROLE } =
          await loadFixture(deployTextFixture);

        await expect(
          controlContract
            .connect(learner)
            .changeStatusAvailable(textContract.address, learner.address),
        ).to.be.revertedWith(
          `AccessControl: account ${learner.address.toLowerCase()} is missing role ${CONTROLLER_ROLE}`,
        );
      });
    });

    describe('changeStatusDone', function () {
      it('Should fail if user does not have CONTROLLER_ROLE', async function () {
        // learner hasn't CONTROLLER_ROLE
        const { controlContract, textContract, learner, CONTROLLER_ROLE } =
          await loadFixture(deployTextFixture);

        await expect(
          controlContract
            .connect(learner)
            .changeStatusDone(textContract.address, learner.address),
        ).to.be.revertedWith(
          `AccessControl: account ${learner.address.toLowerCase()} is missing role ${CONTROLLER_ROLE}`,
        );
      });
    });
  });
});
