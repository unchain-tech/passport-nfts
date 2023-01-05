// Load dependencies
// import { expect } from "chai"
import { ethers, upgrades } from "hardhat"
import { Contract, ContractFactory } from "ethers"

let controlContract: Contract
let textContract1: Contract
let textContract2: Contract

describe("Control Contract", function () {
    // deploy contract
    beforeEach(async function () {
        const controlFactory: ContractFactory = await ethers.getContractFactory(
            "ControlContract",
        )
        const textFactory1: ContractFactory = await ethers.getContractFactory(
            "TextContractTest_1",
        )
        const textFactory2: ContractFactory = await ethers.getContractFactory(
            "TextContractTest_2",
        )

        controlContract = await upgrades.deployProxy(controlFactory, {
            initializer: "initialize",
        })

        await controlContract.deployed()

        textContract1 = await upgrades.deployProxy(
            textFactory1,
            [controlContract.address],
            {
                initializer: "initialize",
            },
        )
        textContract2 = await upgrades.deployProxy(
            textFactory2,
            [controlContract.address],
            {
                initializer: "initialize",
            },
        )

        await textContract1.deployed()
        await textContract2.deployed()
    })

    // test
    it("get text contract information", async function () {
        const [userA, userB] = await ethers.getSigners()
        await controlContract.addTextContractAddress(textContract1.address)
        await controlContract.addTextContractAddress(textContract2.address)
        const textAddressList =
            await controlContract.showTextContractAddressList()

        // // change mint status to UNAVAILABLE
        // await controlContract
        //     .connect(userB)
        //     .changeStatusUnavailable(textContract1.address)

        // // change mint status to AVAILABLE
        // await controlContract
        //     .connect(userB)
        //     .changeStatusAvailable(textContract1.address)

        // change mint status to DONE(text contract 1)
        await controlContract
            .connect(userA)
            .changeStatusDone(textContract1.address)

        // change mint status to DONE(text contract 2)
        await controlContract
            .connect(userB)
            .changeStatusAvailable(textContract2.address)

        // get user status
        const txForGetUserStatus = await controlContract
            .connect(userB)
            .getTexts(textAddressList)

        // select which event to get
        const abi = ["event getUserStatus((uint256, string, address, uint8)[])"]
        const iface = new ethers.utils.Interface(abi)
        const txData = await txForGetUserStatus.wait()

        // decode the all event's output and display
        for (let i = 0; i < txData.events.length; i++) {
            console.log(iface.parseLog(txData.events[i]).args)
        }
    })
})
