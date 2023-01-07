// Load dependencies
// import { expect } from "chai"
import { ethers, upgrades } from "hardhat"
import { Contract, ContractFactory } from "ethers"

let controlContract: Contract
let textContract1: Contract
let textContract2: Contract
let textContractTest: Contract

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
        const textFactoryTest: ContractFactory = await ethers.getContractFactory(
            "TextContract",
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
        textContractTest = await upgrades.deployProxy(
            textFactoryTest,
            [],
            {
                initializer: "initialize",
            },
        )

        await textContract1.deployed()
        await textContract2.deployed()
        await textContractTest.deployed()
    })

    // ADD test
    it("Check user mint status", async function () {
        const [userA] = await ethers.getSigners()

        console.log(`===== Check address =====`);
        console.log(`userA: ${userA.address}`)
        console.log(`ControlContract: ${controlContract.address}`)

        await controlContract.addTextContractAddress(textContractTest.address)

        console.log(`===== Check changeStatus =====`);
        const defaultStatus = await controlContract
            .connect(userA)
            .getStatus(textContractTest.address)
        console.log(`Default Mint Status Unavailable: ${defaultStatus}`)

        await controlContract
            .connect(userA)
            .changeStatusAvailable(textContractTest.address)

        const toAvailable = await controlContract
            .connect(userA)
            .getStatus(textContractTest.address)
        console.log(`Changed Mint Status Available: ${toAvailable}`)

        await controlContract
            .connect(userA)
            .changeStatusDone(textContractTest.address)

        const toDone = await controlContract
            .connect(userA)
            .getStatus(textContractTest.address)
        console.log(`Changed Mint Status Done: ${toDone}`)
    })

    // test
    // it("get text contract information", async function () {
    //     const [userA, userB] = await ethers.getSigners()
    //     await controlContract.addTextContractAddress(textContract1.address)
    //     await controlContract.addTextContractAddress(textContract2.address)
    //     const textAddressList =
    //         await controlContract.showTextContractAddressList()

    //     // change mint status to DONE(text contract 1)
    //     await controlContract
    //         .connect(userA)
    //         .changeStatusDone(textContract1.address)

    //     // change mint status to DONE(text contract 2)
    //     await controlContract
    //         .connect(userB)
    //         .changeStatusAvailable(textContract2.address)

    //     // get user status
    //     const txForGetUserStatus = await controlContract
    //         .connect(userB)
    //         .getTexts(textAddressList)

    //     // select which event to get
    //     const abi = ["event getUserStatus((uint256, string, address, uint8)[])"]
    //     const iface = new ethers.utils.Interface(abi)
    //     const txData = await txForGetUserStatus.wait()

    //     // decode the all event's output and display
    //     for (let i = 0; i < txData.events.length; i++) {
    //         console.log(iface.parseLog(txData.events[i]).args)
    //     }
    // })
})
