// Load dependencies
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

const projectContractNames: string[] = [
  'ETH_dApp',
  'ETH_NFT_Collection',
  'ETH_NFT_Maker',
  'ETH_NFT_Game',
  'ETH_Yield_Farm',
  'ETH_DAO',
  'Polygon_Generative_NFT',
  'Polygon_ENS_Domain',
  'Polygon_Mobile_dApp',
  'Solana_dApp',
  'Solana_NFT_Drop',
  'Solana_Online_Store',
  'Solana_Wallet',
  'NEAR_Election_dApp',
  'NEAR_Hotel_Booking_dApp',
  'NEAR_BikeShare',
  'NEAR_MulPay',
  'AVAX_Messenger',
  'AVAX_AMM',
  'AVAX_Asset_Tokenization',
  'AVAX_Subnet',
  'ICP_Static_Site',
  'ICP_Basic_DEX',
  'ASTAR_SocialFi',
  'XRPL_NFT_Maker',
];

describe('ProjectsController Contract', function () {
  for (const projectContractName of projectContractNames) {
    testProjectsController(projectContractName);
  }
});

function testProjectsController(projectContractName: string) {
  // Define a fixture to reuse the same setup in every test
  async function deployProjectFixture() {
    const ProjectsControllerFactory = await ethers.getContractFactory(
      'ProjectsController',
    );
    const ProjectFactory = await ethers.getContractFactory(projectContractName);

    // Contracts are deployed using the first signer/account by default
    const [owner, controller, learnerA, learnerB] = await ethers.getSigners();

    const ProjectsController = await upgrades.deployProxy(
      ProjectsControllerFactory,
      [],
      {
        initializer: 'initialize',
      },
    );
    const Project = await upgrades.deployProxy(ProjectFactory, [], {
      initializer: 'initialize',
    });

    await ProjectsController.deployed();
    await Project.deployed();

    return {
      ProjectsController,
      Project,
      owner,
      controller,
      learnerA,
      learnerB,
    };
  }

  // Test case
  context(`with ${projectContractName}`, function () {
    describe('addProjectContractAddress & getAllProjectInfo', function () {
      context('when adding a new ProjectContract address', function () {
        it('should keep a list of ProjectContract addresses', async function () {
          /** Arrange */
          const { ProjectsController, Project } = await loadFixture(
            deployProjectFixture,
          );
          const projectName = await Project.getProjectName();
          const passportHash = await Project.getPassportHash();

          /** Act */
          await ProjectsController.addProjectContractAddress(Project.address);

          /** Assert */
          const [projectAddresses, projectNames, passportHashes] =
            await ProjectsController.getAllProjectInfo();
          expect(projectAddresses).to.deep.equal([Project.address]);
          expect(projectNames).to.deep.equal([projectName]);
          expect(passportHashes).to.deep.equal([passportHash]);
        });
      });

      context('when adding a duplicate ProjectContract address', function () {
        it('should keep a list of ProjectContract addresses', async function () {
          const { ProjectsController, Project } = await loadFixture(
            deployProjectFixture,
          );

          await ProjectsController.addProjectContractAddress(Project.address);

          // add duplicate address
          await expect(
            ProjectsController.addProjectContractAddress(Project.address),
          ).to.be.revertedWith('the address is already added!');
        });
      });
    });

    describe('getUserProjectInfoAll', function () {
      it('return user mint statuses', async function () {
        /** Arrange */
        const { ProjectsController, Project, learnerA } = await loadFixture(
          deployProjectFixture,
        );
        await ProjectsController.addProjectContractAddress(Project.address);
        const passportHash = await Project.getPassportHash();

        /** Act */
        const [projectAddresses, passportHashes, mintStatuses] =
          await ProjectsController.getUserProjectInfoAll(learnerA.address);

        /** Assert */
        expect(projectAddresses).to.deep.equal([Project.address]);
        expect(passportHashes).to.deep.equal([passportHash]);
        expect(mintStatuses).to.deep.equal([0]);
      });
    });

    describe('getUserMintStatus', function () {
      it('return UNAVAILABLE', async function () {
        const { ProjectsController, Project, learnerA } = await loadFixture(
          deployProjectFixture,
        );

        expect(
          await ProjectsController.getUserMintStatus(
            Project.address,
            learnerA.address,
          ),
        ).to.equal(0); // MintStatus.UNAVAILABLE
      });
    });

    describe('changeStatusToUnavailable', function () {
      it('change mint status to UNAVAILABLE', async function () {
        const { ProjectsController, Project, learnerA } = await loadFixture(
          deployProjectFixture,
        );

        await ProjectsController.changeStatusToUnavailable(
          Project.address,
          learnerA.address,
        );

        expect(
          await ProjectsController.getUserMintStatus(
            Project.address,
            learnerA.address,
          ),
        ).to.equal(0); // MintStatus.UNAVAILABLE
      });
    });

    describe('changeStatusToAvailable', function () {
      it('change mint status to AVAILABLE', async function () {
        const { ProjectsController, Project, learnerA } = await loadFixture(
          deployProjectFixture,
        );

        await ProjectsController.changeStatusToAvailable(
          Project.address,
          learnerA.address,
        );

        expect(
          await ProjectsController.getUserMintStatus(
            Project.address,
            learnerA.address,
          ),
        ).to.equal(1); // MintStatus.AVAILABLE
      });
    });

    describe('changeStatusToDone', function () {
      it('change mint status to DONE', async function () {
        const { ProjectsController, Project, learnerA } = await loadFixture(
          deployProjectFixture,
        );

        await ProjectsController.changeStatusToDone(
          Project.address,
          learnerA.address,
        );

        expect(
          await ProjectsController.getUserMintStatus(
            Project.address,
            learnerA.address,
          ),
        ).to.equal(2); // MintStatus.DONE
      });
    });

    describe('mint', function () {
      it('emit a NewTokenMinted event of ProjectContract', async function () {
        /** Arrange */
        const { ProjectsController, Project, learnerA } = await loadFixture(
          deployProjectFixture,
        );
        // change learnerA's mint status to AVAILABLE
        await ProjectsController.changeStatusToAvailable(
          Project.address,
          learnerA.address,
        );

        /** Act & Assert */
        await expect(ProjectsController.connect(learnerA).mint(Project.address))
          .to.emit(Project, 'NewTokenMinted')
          .withArgs(learnerA.address, learnerA.address, 1);
      });
    });

    describe('multiMint', function () {
      context('when the correct arguments is specified', function () {
        it('emit a NewTokenMinted event of ProjectContract', async function () {
          /** Arrange */
          const { ProjectsController, Project, owner, learnerA, learnerB } =
            await loadFixture(deployProjectFixture);
          const contractAddresses = [Project.address, Project.address];
          const recipients = [learnerA.address, learnerB.address];

          /** Act & Assert */
          await expect(
            ProjectsController.multiMint(contractAddresses, recipients),
          )
            .to.emit(Project, 'NewTokenMinted')
            .withArgs(owner.address, learnerA.address, 1)
            .to.emit(Project, 'NewTokenMinted')
            .withArgs(owner.address, learnerB.address, 2);
        });
      });

      context(
        'when the number of recipients and contracts do not match',
        function () {
          it('reverts', async function () {
            /** Arrange */
            const { ProjectsController, Project, learnerA } = await loadFixture(
              deployProjectFixture,
            );
            const contractAddresses = [Project.address, Project.address];
            const recipients = [learnerA.address];

            /** Act & Assert */
            // add duplicate address
            await expect(
              ProjectsController.multiMint(contractAddresses, recipients),
            ).to.be.revertedWith('Length of data array must be the same.');
          });
        },
      );
    });
  });
}
