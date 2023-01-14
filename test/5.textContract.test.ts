// Load dependencies
import { expect } from "chai"
import { ethers, upgrades } from "hardhat"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"

import { MintStatus } from "./utils/enum"

describe("Text Contract", function () {
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
    describe("getStatus", function () {
        it("return default status 'UNAVAILABLE' of the learner", async function () {
            const { textContract, learner } = await loadFixture(
                deployTextFixture,
            )

            expect(await textContract.getStatus(learner.address)).to.equal(
                MintStatus.UNAVAILABLE,
            )
        })
    })

    describe("getTextStatus", function () {
        it("return NFT's image-URL and mint status of learner", async function () {
            const { textContract, learner } = await loadFixture(
                deployTextFixture,
            )

            const textStatus = await textContract.getTextStatus(learner.address)

            expect(textStatus.imageUrl).to.equal("TEST_URL")
            expect(textStatus.mintStatus).to.equal(MintStatus.UNAVAILABLE)
        })
    })

    describe("changeStatusUnavailable", function () {
        it("change learner's mint status to UNAVAILABLE", async function () {
            const { textContract, learner } = await loadFixture(
                deployTextFixture,
            )

            await textContract.changeStatusUnavailable(learner.address)
            expect(await textContract.getStatus(learner.address)).to.equal(
                MintStatus.UNAVAILABLE,
            )
        })
    })

    describe("changeStatusAvailable", function () {
        it("change learner's mint status to AVAILABLE", async function () {
            const { textContract, learner } = await loadFixture(
                deployTextFixture,
            )

            await textContract.changeStatusAvailable(learner.address)
            expect(await textContract.getStatus(learner.address)).to.equal(
                MintStatus.AVAILABLE,
            )
        })
    })

    describe("changeStatusDone", function () {
        it("change learner's mint status to DONE", async function () {
            const { textContract, learner } = await loadFixture(
                deployTextFixture,
            )

            await textContract.changeStatusDone(learner.address)
            expect(await textContract.getStatus(learner.address)).to.equal(
                MintStatus.DONE,
            )
        })
    })

    describe("mint", function () {
        context("when learner's mint status is AVAILABLE", function () {
            it("emit a NewTokenMinted event", async function () {
                const { textContract, learner } = await loadFixture(
                    deployTextFixture,
                )

                // NOTE: In practice, the mint status is changed by a user
                // with the Controller-Role calling from ControlContract.
                await textContract.changeStatusAvailable(learner.address)

                await expect(textContract.mint(learner.address))
                    .to.emit(textContract, "NewTokenMinted")
                    .withArgs(learner.address, learner.address, 1)
            })
        })

        context("when learner's mint status is UNAVAILABLE", function () {
            it("reverts", async function () {
                const { textContract, learner } = await loadFixture(
                    deployTextFixture,
                )

                // check status UNAVAILABLE
                await expect(
                    textContract.mint(learner.address),
                ).to.be.revertedWith("you're mint status is not AVAILABLE!")
            })
        })

        context("when learner's mint status is DONE", function () {
            it("reverts", async function () {
                const { textContract, learner } = await loadFixture(
                    deployTextFixture,
                )

                // check status DONE
                await textContract.changeStatusDone(learner.address)
                await expect(
                    textContract.mint(learner.address),
                ).to.be.revertedWith("you're mint status is not AVAILABLE!")
            })
        })
    })
})
