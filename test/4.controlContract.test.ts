// Load dependencies
import { expect } from "chai"
import { ethers, upgrades } from "hardhat"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"

import { MintStatus } from "./enum"

describe("Control Contract", function () {
    // Define a fixture to reuse the same setup in every test
    async function deployTextFixture() {
        const ControlContractFactory = await ethers.getContractFactory(
            "ControlContract",
        )
        const TextContractFactory = await ethers.getContractFactory(
            "TextContract",
        )

        // Contracts are deployed using the first signer/account by default
        const [owner, controller, learner] = await ethers.getSigners()

        const controlContract = await upgrades.deployProxy(
            ControlContractFactory,
            [],
            {
                initializer: "initialize",
            },
        )
        const textContract = await upgrades.deployProxy(
            TextContractFactory,
            [],
            {
                initializer: "initialize",
            },
        )

        await controlContract.deployed()
        await textContract.deployed()

        return { controlContract, textContract, owner, controller, learner }
    }

    // Test case
    describe("adding a TextContract address", function () {
        context("when adding a new TextContract address", function () {
            it("should keep a list of TextContract addresses", async function () {
                const { controlContract, textContract } = await loadFixture(
                    deployTextFixture,
                )

                await controlContract.addTextContractAddress(
                    textContract.address,
                )
                const textContractAddressList =
                    await controlContract.showTextContractAddressList()

                expect(textContractAddressList[0]).to.equal(
                    textContract.address,
                )
            })
        })

        context("when adding a duplicate TextContract address", function () {
            it("should keep a list of TextContract addresses", async function () {
                const { controlContract, textContract } = await loadFixture(
                    deployTextFixture,
                )

                await controlContract.addTextContractAddress(
                    textContract.address,
                )

                // add duplicate address
                await expect(
                    controlContract.addTextContractAddress(
                        textContract.address,
                    ),
                ).to.be.revertedWith("the address is already added!")
            })
        })
    })

    describe("getTexts", function () {
        // TODO: getTextsの戻り値をassertionで確認するテスト方法にする
        it("return user mint statuses", async function () {
            const { controlContract, textContract, learner } =
                await loadFixture(deployTextFixture)

            const textContractList = [textContract.address]
            const txForGetUserStatus = await controlContract.getTexts(
                textContractList,
                learner.address,
            )

            // select which event to get
            const abi = ["event getUserStatus((string, uint8)[])"]
            const iface = new ethers.utils.Interface(abi)
            const txData = await txForGetUserStatus.wait()

            // decode the all event's output and display
            for (let i = 0; i < txData.events.length; i++) {
                console.log(iface.parseLog(txData.events[i]).args)
            }
        })
    })

    describe("getStatus", function () {
        it("return UNAVAILABLE", async function () {
            const { controlContract, textContract, learner } =
                await loadFixture(deployTextFixture)
            expect(
                await controlContract.getStatus(
                    textContract.address,
                    learner.address,
                ),
            ).to.equal(MintStatus.UNAVAILABLE)
        })
    })

    describe("changeStatusUnavailable", function () {
        it("change mint status to UNAVAILABLE", async function () {
            const { controlContract, textContract, learner } =
                await loadFixture(deployTextFixture)

            await controlContract.changeStatusUnavailable(
                textContract.address,
                learner.address,
            )
            expect(
                await controlContract.getStatus(
                    textContract.address,
                    learner.address,
                ),
            ).to.equal(MintStatus.UNAVAILABLE)
        })
    })

    describe("changeStatusAvailable", function () {
        it("change mint status to AVAILABLE", async function () {
            const { controlContract, textContract, learner } =
                await loadFixture(deployTextFixture)

            await controlContract.changeStatusAvailable(
                textContract.address,
                learner.address,
            )
            expect(
                await controlContract.getStatus(
                    textContract.address,
                    learner.address,
                ),
            ).to.equal(MintStatus.AVAILABLE)
        })
    })

    describe("changeStatusDone", function () {
        it("change mint status to DONE", async function () {
            const { controlContract, textContract, learner } =
                await loadFixture(deployTextFixture)

            await controlContract.changeStatusDone(
                textContract.address,
                learner.address,
            )
            expect(
                await controlContract.getStatus(
                    textContract.address,
                    learner.address,
                ),
            ).to.equal(MintStatus.DONE)
        })
    })

    describe("mint", function () {
        //   TODO add test
    })
})
