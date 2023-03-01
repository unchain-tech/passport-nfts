// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('ProjectsController Contract AccessControl', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployTextFixture() {
    const ProjectsControllerFactory = await ethers.getContractFactory(
      'ProjectsController',
    );
    const ETHDappFactory = await ethers.getContractFactory('ETH_dApp');

    // Contracts are deployed using the first signer/account by default
    const [owner, controller, learner] = await ethers.getSigners();

    const ProjectsController = await upgrades.deployProxy(
      ProjectsControllerFactory,
      [],
      {
        initializer: 'initialize',
      },
    );
    const ETHDapp = await upgrades.deployProxy(ETHDappFactory, [], {
      initializer: 'initialize',
    });

    await ProjectsController.deployed();
    await ETHDapp.deployed();

    // Setup role
    const ADMIN_ROLE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes('ADMIN_ROLE'),
    );
    const CONTROLLER_ROLE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes('CONTROLLER_ROLE'),
    );

    return {
      ProjectsController,
      ETHDapp,
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
    const { ProjectsController, owner, ADMIN_ROLE } = await loadFixture(
      deployTextFixture,
    );

    const isAdmin = await ProjectsController.hasRole(ADMIN_ROLE, owner.address);

    expect(isAdmin).to.equal(true);
  });

  it('Contract owner should have CONTROLLER_ROLE', async function () {
    const { ProjectsController, owner, CONTROLLER_ROLE } = await loadFixture(
      deployTextFixture,
    );

    const isController = await ProjectsController.hasRole(
      CONTROLLER_ROLE,
      owner.address,
    );

    expect(isController).to.equal(true);
  });

  // ===== grant =====
  it('Contract owner should be able to grant the CONTROLLER_ROLE', async function () {
    const { ProjectsController, controller, CONTROLLER_ROLE } =
      await loadFixture(deployTextFixture);

    // grant CONTROLLER_ROLE to controller
    await ProjectsController.grantControllerRole(controller.address);

    const isController = await ProjectsController.hasRole(
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
        const { ProjectsController, controller, learner, ADMIN_ROLE } =
          await loadFixture(deployTextFixture);

        await expect(
          ProjectsController.connect(controller).grantControllerRole(
            learner.address,
          ),
        ).to.be.revertedWith(
          `AccessControl: account ${controller.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });
    });

    describe('multiMint', function () {
      it('Should fail if user does not have ADMIN_ROLE', async function () {
        // controller hasn't ADMIN_ROLE
        const { ProjectsController, ETHDapp, controller, learner, ADMIN_ROLE } =
          await loadFixture(deployTextFixture);
        const recipients = [learner.address];
        const contractAddresses = [ETHDapp.address];

        await expect(
          ProjectsController.connect(controller).multiMint(
            recipients,
            contractAddresses,
          ),
        ).to.be.revertedWith(
          `AccessControl: account ${controller.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });
    });
  });

  context('Users without CONTROLLER_ROLE', function () {
    describe('addProjectContractAddress', function () {
      it('Should fail if user does not have CONTROLLER_ROLE', async function () {
        // learner hasn't CONTROLLER_ROLE
        const { ProjectsController, ETHDapp, learner, CONTROLLER_ROLE } =
          await loadFixture(deployTextFixture);

        await expect(
          ProjectsController.connect(learner).addProjectContractAddress(
            ETHDapp.address,
          ),
        ).to.be.revertedWith(
          `AccessControl: account ${learner.address.toLowerCase()} is missing role ${CONTROLLER_ROLE}`,
        );
      });
    });

    describe('getAllProjectInfo', function () {
      it('Should fail if user does not have CONTROLLER_ROLE', async function () {
        // learner hasn't CONTROLLER_ROLE
        const { ProjectsController, learner, CONTROLLER_ROLE } =
          await loadFixture(deployTextFixture);

        await expect(
          ProjectsController.connect(learner).getAllProjectInfo(),
        ).to.be.revertedWith(
          `AccessControl: account ${learner.address.toLowerCase()} is missing role ${CONTROLLER_ROLE}`,
        );
      });
    });

    describe('getUserProjectInfoAll', function () {
      it('Should fail if user does not have CONTROLLER_ROLE', async function () {
        // learner hasn't CONTROLLER_ROLE
        const { ProjectsController, ETHDapp, learner, CONTROLLER_ROLE } =
          await loadFixture(deployTextFixture);

        await expect(
          ProjectsController.connect(learner).getUserProjectInfoAll(
            [ETHDapp.address],
            learner.address,
          ),
        ).to.be.revertedWith(
          `AccessControl: account ${learner.address.toLowerCase()} is missing role ${CONTROLLER_ROLE}`,
        );
      });
    });

    describe('getUserMintStatus', function () {
      it('Should fail if user does not have CONTROLLER_ROLE', async function () {
        // learner hasn't CONTROLLER_ROLE
        const { ProjectsController, ETHDapp, learner, CONTROLLER_ROLE } =
          await loadFixture(deployTextFixture);

        await expect(
          ProjectsController.connect(learner).getUserMintStatus(
            ETHDapp.address,
            learner.address,
          ),
        ).to.be.revertedWith(
          `AccessControl: account ${learner.address.toLowerCase()} is missing role ${CONTROLLER_ROLE}`,
        );
      });
    });

    describe('changeStatusUnavailable', function () {
      it('Should fail if user does not have CONTROLLER_ROLE', async function () {
        // learner hasn't CONTROLLER_ROLE
        const { ProjectsController, ETHDapp, learner, CONTROLLER_ROLE } =
          await loadFixture(deployTextFixture);

        await expect(
          ProjectsController.connect(learner).changeStatusUnavailable(
            ETHDapp.address,
            learner.address,
          ),
        ).to.be.revertedWith(
          `AccessControl: account ${learner.address.toLowerCase()} is missing role ${CONTROLLER_ROLE}`,
        );
      });
    });

    describe('changeStatusAvailable', function () {
      it('Should fail if user does not have CONTROLLER_ROLE', async function () {
        // learner hasn't CONTROLLER_ROLE
        const { ProjectsController, ETHDapp, learner, CONTROLLER_ROLE } =
          await loadFixture(deployTextFixture);

        await expect(
          ProjectsController.connect(learner).changeStatusAvailable(
            ETHDapp.address,
            learner.address,
          ),
        ).to.be.revertedWith(
          `AccessControl: account ${learner.address.toLowerCase()} is missing role ${CONTROLLER_ROLE}`,
        );
      });
    });

    describe('changeStatusDone', function () {
      it('Should fail if user does not have CONTROLLER_ROLE', async function () {
        // learner hasn't CONTROLLER_ROLE
        const { ProjectsController, ETHDapp, learner, CONTROLLER_ROLE } =
          await loadFixture(deployTextFixture);

        await expect(
          ProjectsController.connect(learner).changeStatusDone(
            ETHDapp.address,
            learner.address,
          ),
        ).to.be.revertedWith(
          `AccessControl: account ${learner.address.toLowerCase()} is missing role ${CONTROLLER_ROLE}`,
        );
      });
    });
  });
});
