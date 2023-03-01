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
  describe('adding a ETHDapp address', function () {
    context('when adding a new ProjectContract address', function () {
      it('should keep a list of ProjectContract addresses', async function () {
        const { ProjectsController, ETHDapp } = await loadFixture(
          deployProjectFixture,
        );

        await ProjectsController.addProjectContractAddress(ETHDapp.address);
        const ProjectContractAddressList =
          await ProjectsController.getAllProjectInfo();

        expect(ProjectContractAddressList[0].projectContractAddress).to.equal(
          ETHDapp.address,
        );
        expect(ProjectContractAddressList[0].passportHash).to.equal(
          'QmXk3kdRvV6TV9yZvtZPgKHoYmywnURy3Qhs8Bjo5szg1J',
        );
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
    // TODO: getProjectsの戻り値をassertionで確認するテスト方法にする
    it('return user mint statuses', async function () {
      const { ProjectsController, ETHDapp, learnerA } = await loadFixture(
        deployProjectFixture,
      );

      const ProjectContractList = [ETHDapp.address];
      const txForGetUserStatus = await ProjectsController.getUserProjectInfoAll(
        ProjectContractList,
        learnerA.address,
      );

      // select which event to get
      const abi = ['event getUserStatus((string, uint8)[])'];
      const iface = new ethers.utils.Interface(abi);
      const txData = await txForGetUserStatus.wait();

      // decode the all event's output and display
      for (let i = 0; i < txData.events.length; i++) {
        console.log(iface.parseLog(txData.events[i]).args);
      }
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

  describe('changeStatusUnavailable', function () {
    it('change mint status to UNAVAILABLE', async function () {
      const { ProjectsController, ETHDapp, learnerA } = await loadFixture(
        deployProjectFixture,
      );

      await ProjectsController.changeStatusUnavailable(
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

  describe('changeStatusAvailable', function () {
    it('change mint status to AVAILABLE', async function () {
      const { ProjectsController, ETHDapp, learnerA } = await loadFixture(
        deployProjectFixture,
      );

      await ProjectsController.changeStatusAvailable(
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

  describe('changeStatusDone', function () {
    it('change mint status to DONE', async function () {
      const { ProjectsController, ETHDapp, learnerA } = await loadFixture(
        deployProjectFixture,
      );

      await ProjectsController.changeStatusDone(
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
      const { ProjectsController, ETHDapp, learnerA } = await loadFixture(
        deployProjectFixture,
      );

      // change learnerA's mint status to AVAILABLE
      await ProjectsController.changeStatusAvailable(
        ETHDapp.address,
        learnerA.address,
      );

      await expect(ProjectsController.connect(learnerA).mint(ETHDapp.address))
        .to.emit(ETHDapp, 'NewTokenMinted')
        .withArgs(learnerA.address, learnerA.address, 1);
    });
  });

  describe('multiMint', function () {
    context('when the correct arguments is specified', function () {
      it('emit a NewTokenMinted event of ProjectContract', async function () {
        const { ProjectsController, ETHDapp, owner, learnerA, learnerB } =
          await loadFixture(deployProjectFixture);

        const recipients = [learnerA.address, learnerB.address];
        const contractAddresses = [ETHDapp.address, ETHDapp.address];
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
          const { ProjectsController, ETHDapp, learnerA } = await loadFixture(
            deployProjectFixture,
          );

          const recipients = [learnerA.address];
          const contractAddresses = [ETHDapp.address, ETHDapp.address];

          // add duplicate address
          await expect(
            ProjectsController.multiMint(recipients, contractAddresses),
          ).to.be.revertedWith('Length of data array must be the same.');
        });
      },
    );
  });
});
