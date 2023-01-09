// Load dependencies
import { expect } from "chai"
import { ethers, upgrades } from "hardhat"
import { Contract, ContractFactory } from "ethers"

let textContract: Contract

describe("Text Contract", function () {
    // deploy contract
    beforeEach(async function () {
        const textFactoryTest: ContractFactory =
            await ethers.getContractFactory("TextContract")

        textContract = await upgrades.deployProxy(textFactoryTest, [], {
            initializer: "initialize",
        })

        await textContract.deployed()
    })

    // test
    it("Reverts when Mint status isn't AVAILABLE", async function () {
        // default status is UNAVAILABLE
        const [userA] = await ethers.getSigners()

        await expect(textContract.connect(userA).mint(userA.address))
            .to
            .be
            .revertedWith(
                "you're mint status is not AVAILABLE!"
            )

        // change mint status DONE
        await textContract.connect(userA).changeStatusDone(userA.address)

        await expect(textContract.connect(userA).mint(userA.address))
            .to
            .be
            .revertedWith(
                "you're mint status is not AVAILABLE!"
            )
    })

    // test
    it("Get event info", async function () {
        // ===== test UserA =====
        const [userA] = await ethers.getSigners()

        // change mint status AVAILABLE
        await textContract.connect(userA).changeStatusAvailable(userA.address)

        // execute mint
        const txUserA = await textContract.connect(userA).mint(userA.address)

        // get event
        const abiUserA = ["event NewTokenMinted(address, address, uint256)"]
        const ifaceUserA = new ethers.utils.Interface(abiUserA)
        const txDataUserA = await txUserA.wait()
        const lastEventsIndexUserA = txDataUserA.events.length - 1
        const lastEventDataUserA = txDataUserA.events[lastEventsIndexUserA]

        console.log(ifaceUserA.parseLog(lastEventDataUserA).args)

        // ===== test UserB =====
        const [userB] = await ethers.getSigners()

        // change mint status AVAILABLE
        await textContract.connect(userB).changeStatusAvailable(userB.address)

        // execute mint
        const txUserB = await textContract.connect(userB).mint(userB.address)

        // get event
        const abiUserB = ["event NewTokenMinted(address, address, uint256)"]
        const ifaceUserB = new ethers.utils.Interface(abiUserB)
        const txDataUserB = await txUserB.wait()
        const lastEventsIndexUserB = txDataUserB.events.length - 1
        const lastEventDataUserB = txDataUserB.events[lastEventsIndexUserB]

        console.log(ifaceUserB.parseLog(lastEventDataUserB).args)
    })
})
