// Load dependencies
import { expect } from "chai"
import { ethers, upgrades } from "hardhat"
import { Contract, ContractFactory } from "ethers"

let controlContract: Contract
let textContractTest: Contract

describe("Control Contract", function () {
    // deploy contract
    beforeEach(async function () {
        const controlFactory: ContractFactory = await ethers.getContractFactory(
            "ControlContract",
        )
        const textFactoryTest: ContractFactory =
            await ethers.getContractFactory("TextContract")

        controlContract = await upgrades.deployProxy(controlFactory, {
            initializer: "initialize",
        })

        await controlContract.deployed()

        textContractTest = await upgrades.deployProxy(textFactoryTest, [], {
            initializer: "initialize",
        })

        await textContractTest.deployed()
    })

    // test
    it("Check user mint status", async function () {
        const [userA] = await ethers.getSigners()

        console.log(`===== Check address =====`)
        console.log(`userA: ${userA.address}`)
        console.log(`ControlContract: ${controlContract.address}`)

        await controlContract.addTextContractAddress(textContractTest.address)

        console.log(`===== Check changeStatus =====`)
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
    it("Get text contract information", async function () {
        const [userA] = await ethers.getSigners()
        await controlContract.addTextContractAddress(textContractTest.address)
        const textAddressList =
            await controlContract.showTextContractAddressList()

        // change mint status to DONE
        await controlContract
            .connect(userA)
            .changeStatusAvailable(textContractTest.address)

        // get user status
        const txForGetUserStatus = await controlContract
            .connect(userA)
            .getTexts(textAddressList)

        // select which event to get
        const abi = ["event getUserStatus((string, uint8)[])"]
        const iface = new ethers.utils.Interface(abi)
        const txData = await txForGetUserStatus.wait()

        // decode the all event's output and display
        for (let i = 0; i < txData.events.length; i++) {
            console.log(iface.parseLog(txData.events[i]).args)
        }
    })

    // test
    it("Mint NFT", async function () {
        const [userA, userB] = await ethers.getSigners()
        await controlContract.addTextContractAddress(textContractTest.address)
        await expect(
            controlContract.addTextContractAddress(textContractTest.address),
        ).to.be.revertedWith("the address is already added!")
        const textAddressList =
            await controlContract.showTextContractAddressList()

        // change mint status AVAILABLE
        await controlContract
            .connect(userA)
            .changeStatusAvailable(textContractTest.address)

        // check when user without mint role manipulate control contract, reverted
        await expect(
            controlContract
                .connect(userB)
                .changeStatusAvailable(textContractTest.address),
        ).to.be.reverted

        // grant controller role to userB
        await controlContract.connect(userA).grantControllerRole(userB.address)

        // check if userB can manipulate control contract
        await controlContract
            .connect(userB)
            .changeStatusAvailable(textContractTest.address)

        // mint
        const tx = await controlContract
            .connect(userA)
            .mint(textContractTest.address)
        tx.wait()
        console.log(`mint result: ${tx}`)

        // get user status
        const txForGetUserStatus = await controlContract
            .connect(userA)
            .getTexts(textAddressList)

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
