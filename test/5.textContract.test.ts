// Load dependencies
// import { expect } from "chai"
import { ethers, upgrades } from "hardhat"
import { Contract, ContractFactory } from "ethers"

let textContract: Contract

describe("Text Contract", function () {
  // deploy contract
  beforeEach(async function () {
    const textFactoryTest: ContractFactory = await ethers.getContractFactory(
      "TextContract",
    )

    textContract = await upgrades.deployProxy(
      textFactoryTest,
      [],
      {
        initializer: "initialize",
      },
    )

    await textContract.deployed()
  })

  // test
  it("Get event info", async function () {
    // ===== test UserA =====
    const [userA] = await ethers.getSigners()

    // execute mint
    const txUserA = await textContract
      .connect(userA)
      .mint(userA.address);

    // get event
    const abiUserA = ["event NewTokenMinted(address, address, uint256)"]
    const ifaceUserA = new ethers.utils.Interface(abiUserA)
    const txDataUserA = await txUserA.wait()
    const lastEventsIndexUserA = txDataUserA.events.length - 1;
    const lastEventDataUserA = txDataUserA.events[lastEventsIndexUserA]

    console.log(ifaceUserA.parseLog(lastEventDataUserA).args)

    // ===== test UserB =====
    const [userB] = await ethers.getSigners()

    // execute mint
    const txUserB = await textContract
      .connect(userB)
      .mint(userB.address);

    // get event
    const abiUserB = ["event NewTokenMinted(address, address, uint256)"]
    const ifaceUserB = new ethers.utils.Interface(abiUserB)
    const txDataUserB = await txUserB.wait()
    const lastEventsIndexUserB = txDataUserB.events.length - 1;
    const lastEventDataUserB = txDataUserB.events[lastEventsIndexUserB]

    console.log(ifaceUserB.parseLog(lastEventDataUserB).args)
  })
})
