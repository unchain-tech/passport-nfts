// Load dependencies
import { expect } from "chai"
import { ethers, upgrades } from "hardhat"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"

describe("Text Contract", function () {
    // Status to manage user's mint status
    enum MintStatus {
        UNAVAILABLE,
        AVAILABLE,
        DONE,
    }

    // Define a fixture to reuse the same setup in every test
    async function deployTextFixture() {
        const TextContractFactory = await ethers.getContractFactory(
            "TextContract",
        )

        // Contracts are deployed using the first signer/account by default
        const [owner, learner] = await ethers.getSigners()

        const textContract = await upgrades.deployProxy(
            TextContractFactory,
            [],
            {
                initializer: "initialize",
            },
        )

        await textContract.deployed()

        return { textContract, owner, learner }
    }

    // Test case
    it("Should get default status 'UNAVAILABLE' of the learner", async function () {
        const { textContract, learner } = await loadFixture(deployTextFixture)

        expect(await textContract.getStatus(learner.address)).to.equal(
            MintStatus.UNAVAILABLE,
        )
    })

    it("Should get image-URL and mint status of learner", async function () {
        const { textContract, learner } = await loadFixture(deployTextFixture)

        const textStatus = await textContract.getTextStatus(learner.address)

        expect(textStatus.imageUrl).to.equal("TEST_URL")
        expect(textStatus.mintStatus).to.equal(MintStatus.UNAVAILABLE)
    })

    it("Should change of learner's mint status to UNAVAILABLE", async function () {
        const { textContract, learner } = await loadFixture(deployTextFixture)

        await textContract.changeStatusUnavailable(learner.address)
        expect(await textContract.getStatus(learner.address)).to.equal(
            MintStatus.UNAVAILABLE,
        )
    })

    it("Should change of learner's mint status to AVAILABLE", async function () {
        const { textContract, learner } = await loadFixture(deployTextFixture)

        await textContract.changeStatusAvailable(learner.address)
        expect(await textContract.getStatus(learner.address)).to.equal(
            MintStatus.AVAILABLE,
        )
    })

    it("Should change of learner's mint status to DONE", async function () {
        const { textContract, learner } = await loadFixture(deployTextFixture)

        await textContract.changeStatusDone(learner.address)
        expect(await textContract.getStatus(learner.address)).to.equal(
            MintStatus.DONE,
        )
    })

    it("Should emit NewTokenMinted events", async function () {
        const { textContract, learner } = await loadFixture(deployTextFixture)

        // NOTE: In practice, the mint status is changed by a user
        // with the Controller-Role calling from ControlContract.
        await textContract.changeStatusAvailable(learner.address)

        await expect(textContract.mint(learner.address))
            .to.emit(textContract, "NewTokenMinted")
            .withArgs(learner.address, learner.address, 1)
    })

    it("Should fail if learner's mint status isn't AVAILABLE", async function () {
        const { textContract, learner } = await loadFixture(deployTextFixture)

        // check status UNAVAILABLE
        await expect(textContract.mint(learner.address)).to.be.revertedWith(
            "you're mint status is not AVAILABLE!",
        )

        // check status DONE
        await textContract.changeStatusDone(learner.address)
        await expect(textContract.mint(learner.address)).to.be.revertedWith(
            "you're mint status is not AVAILABLE!",
        )
    })
})
