// Load dependencies
import { expect } from "chai"
import { ethers, upgrades } from "hardhat"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import { Contract, ContractFactory } from "ethers"

describe("Text Contract", function () {
    // Define a fixture to reuse the same setup in every test
    async function deployTextFixture() {
        const TextContractFactory = await ethers.getContractFactory("TextContract")

        // Contracts are deployed using the first signer/account by default
        const [owner] = await ethers.getSigners()

        const textContract = await upgrades.deployProxy(TextContractFactory, [], {
            initializer: "initialize",
        })

        await textContract.deployed()

        return { textContract, owner }
    }

    // Test case
    it("Reverts when Mint status isn't AVAILABLE", async function () {
        const { textContract, owner } = await loadFixture(deployTextFixture)

        await expect(
            textContract.mint(owner.address),
        ).to.be.revertedWith("you're mint status is not AVAILABLE!")

        // change mint status DONE
        await textContract.changeStatusDone(owner.address)

        await expect(
            textContract.mint(owner.address),
        ).to.be.revertedWith("you're mint status is not AVAILABLE!")
    })

    // // test
    // it("Get event info", async function () {
    //     const { textContract, owner } = await loadFixture(deployTextFixture)

    //     // ===== test UserA =====
    //     const [userA] = await ethers.getSigners()

    //     // change mint status AVAILABLE
    //     await textContract.connect(userA).changeStatusAvailable(userA.address)

    //     // execute mint
    //     const txUserA = await textContract.connect(userA).mint(userA.address)

    //     // get event
    //     const abiUserA = ["event NewTokenMinted(address, address, uint256)"]
    //     const ifaceUserA = new ethers.utils.Interface(abiUserA)
    //     const txDataUserA = await txUserA.wait()
    //     const lastEventsIndexUserA = txDataUserA.events.length - 1
    //     const lastEventDataUserA = txDataUserA.events[lastEventsIndexUserA]

    //     console.log(ifaceUserA.parseLog(lastEventDataUserA).args)

    //     // ===== test UserB =====
    //     const [userB] = await ethers.getSigners()

    //     // change mint status AVAILABLE
    //     await textContract.connect(userB).changeStatusAvailable(userB.address)

    //     // execute mint
    //     const txUserB = await textContract.connect(userB).mint(userB.address)

    //     // get event
    //     const abiUserB = ["event NewTokenMinted(address, address, uint256)"]
    //     const ifaceUserB = new ethers.utils.Interface(abiUserB)
    //     const txDataUserB = await txUserB.wait()
    //     const lastEventsIndexUserB = txDataUserB.events.length - 1
    //     const lastEventDataUserB = txDataUserB.events[lastEventsIndexUserB]

    //     console.log(ifaceUserB.parseLog(lastEventDataUserB).args)
    // })
})
