// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('ProjectsController Contract', function () {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const ProjectsControllerFactory = await ethers.getContractFactory(
      'ProjectsController',
    );
    const ETHDappFactory = await ethers.getContractFactory('ETH_dApp');

    // Contracts are deployed using the first signer/account by default
    const [owner, controller, learnerA, learnerB] = await ethers.getSigners();

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

    return {
      ProjectsController,
      ETHDapp,
      owner,
      controller,
      learnerA,
      learnerB,
    };
  }

  // Test case
  describe('addProjectContractAddress & getAllProjectInfo', function () {
    context('when adding a new ProjectContract address', function () {
      it('should keep a list of ProjectContract addresses', async function () {
        /** Arrange */
        const { ProjectsController, ETHDapp } = await loadFixture(
          deployProjectFixture,
        );
        const projectName = await ETHDapp.getProjectName();
        const passportHash = await ETHDapp.getPassportHash();

        /** Act */
        await ProjectsController.addProjectContractAddress(ETHDapp.address);

        /** Assert */
        const [projectAddresses, projectNames, passportHashes] =
          await ProjectsController.getAllProjectInfo();
        expect(projectAddresses).to.deep.equal([ETHDapp.address]);
        expect(projectNames).to.deep.equal([projectName]);
        expect(passportHashes).to.deep.equal([passportHash]);
      });
    });

    context('when adding a duplicate ProjectContract address', function () {
      it('should keep a list of ProjectContract addresses', async function () {
        const { ProjectsController, ETHDapp } = await loadFixture(
          deployProjectFixture,
        );

        await ProjectsController.addProjectContractAddress(ETHDapp.address);

        // add duplicate address
        await expect(
          ProjectsController.addProjectContractAddress(ETHDapp.address),
        ).to.be.revertedWith('the address is already added!');
      });
    });
  });

  describe('getUserProjectInfoAll', function () {
    it('return user mint statuses', async function () {
      /** Arrange */
      const { ProjectsController, ETHDapp, learnerA } = await loadFixture(
        deployProjectFixture,
      );
      await ProjectsController.addProjectContractAddress(ETHDapp.address);
      const passportHash = await ETHDapp.getPassportHash();

      /** Act */
      const [projectAddresses, passportHashes, mintStatuses] =
        await ProjectsController.getUserProjectInfoAll(learnerA.address);

      /** Assert */
      expect(projectAddresses).to.deep.equal([ETHDapp.address]);
      expect(passportHashes).to.deep.equal([passportHash]);
      expect(mintStatuses).to.deep.equal([0]);
    });
  });

  describe('getUserMintStatus', function () {
    it('return UNAVAILABLE', async function () {
      const { ProjectsController, ETHDapp, learnerA } = await loadFixture(
        deployProjectFixture,
      );

      expect(
        await ProjectsController.getUserMintStatus(
          ETHDapp.address,
          learnerA.address,
        ),
      ).to.equal(0); // MintStatus.UNAVAILABLE
    });
  });

  describe('changeStatusToUnavailable', function () {
    it('change mint status to UNAVAILABLE', async function () {
      const { ProjectsController, ETHDapp, learnerA } = await loadFixture(
        deployProjectFixture,
      );

      await ProjectsController.changeStatusToUnavailable(
        ETHDapp.address,
        learnerA.address,
      );

      expect(
        await ProjectsController.getUserMintStatus(
          ETHDapp.address,
          learnerA.address,
        ),
      ).to.equal(0); // MintStatus.UNAVAILABLE
    });
  });

  describe('changeStatusToAvailable', function () {
    it('change mint status to AVAILABLE', async function () {
      const { ProjectsController, ETHDapp, learnerA } = await loadFixture(
        deployProjectFixture,
      );

      await ProjectsController.changeStatusToAvailable(
        ETHDapp.address,
        learnerA.address,
      );

      expect(
        await ProjectsController.getUserMintStatus(
          ETHDapp.address,
          learnerA.address,
        ),
      ).to.equal(1); // MintStatus.AVAILABLE
    });
  });

  describe('changeStatusToDone', function () {
    it('change mint status to DONE', async function () {
      const { ProjectsController, ETHDapp, learnerA } = await loadFixture(
        deployProjectFixture,
      );

      await ProjectsController.changeStatusToDone(
        ETHDapp.address,
        learnerA.address,
      );

      expect(
        await ProjectsController.getUserMintStatus(
          ETHDapp.address,
          learnerA.address,
        ),
      ).to.equal(2); // MintStatus.DONE
    });
  });

  describe('mint', function () {
    it('emit a NewTokenMinted event of ProjectContract', async function () {
      /** Arrange */
      const { ProjectsController, ETHDapp, learnerA } = await loadFixture(
        deployProjectFixture,
      );
      // change learnerA's mint status to AVAILABLE
      await ProjectsController.changeStatusToAvailable(
        ETHDapp.address,
        learnerA.address,
      );

      /** Act & Assert */
      await expect(ProjectsController.connect(learnerA).mint(ETHDapp.address))
        .to.emit(ETHDapp, 'NewTokenMinted')
        .withArgs(learnerA.address, learnerA.address, 1);
    });
  });

  describe('multiMint', function () {
    context('when the correct arguments is specified', function () {
      it('emit a NewTokenMinted event of ProjectContract', async function () {
        /** Arrange */
        const { ProjectsController, ETHDapp, owner, learnerA, learnerB } =
          await loadFixture(deployProjectFixture);
        const recipients = [learnerA.address, learnerB.address];
        const contractAddresses = [ETHDapp.address, ETHDapp.address];

        /** Act & Assert */
        await expect(
          ProjectsController.multiMint(recipients, contractAddresses),
        )
          .to.emit(ETHDapp, 'NewTokenMinted')
          .withArgs(owner.address, learnerA.address, 1)
          .to.emit(ETHDapp, 'NewTokenMinted')
          .withArgs(owner.address, learnerB.address, 2);
      });
    });

    context(
      'when the number of recipients and contracts do not match',
      function () {
        it('reverts', async function () {
          /** Arrange */
          const { ProjectsController, ETHDapp, learnerA } = await loadFixture(
            deployProjectFixture,
          );
          const recipients = [learnerA.address];
          const contractAddresses = [ETHDapp.address, ETHDapp.address];

          /** Act & Assert */
          // add duplicate address
          await expect(
            ProjectsController.multiMint(recipients, contractAddresses),
          ).to.be.revertedWith('Length of data array must be the same.');
        });
      },
    );
  });
});
