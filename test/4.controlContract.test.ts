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
        const [owner, userA] = await ethers.getSigners()

        console.log(`===== Check address =====`)
        console.log(`userA: ${owner.address}`)
        console.log(`ControlContract: ${controlContract.address}`)

        await controlContract.addTextContractAddress(textContractTest.address)

        console.log(`===== Check changeStatus =====`)
        const defaultStatus = await controlContract
            .connect(owner)
            .getStatus(textContractTest.address, userA.address)
        console.log(`Default Mint Status Unavailable: ${defaultStatus}`)

        await controlContract
            .connect(owner)
            .changeStatusAvailable(textContractTest.address, userA.address)

        const toAvailable = await controlContract
            .connect(owner)
            .getStatus(textContractTest.address, userA.address)
        console.log(`Changed Mint Status Available: ${toAvailable}`)

        await controlContract
            .connect(owner)
            .changeStatusDone(textContractTest.address, userA.address)

        const toDone = await controlContract
            .connect(owner)
            .getStatus(textContractTest.address, userA.address)
        console.log(`Changed Mint Status Done: ${toDone}`)
    })

    // test
    it("Get text contract information", async function () {
        const [owner, userA] = await ethers.getSigners()
        await controlContract.addTextContractAddress(textContractTest.address)
        const textAddressList =
            await controlContract.showTextContractAddressList()

        // change mint status to DONE
        await controlContract
            .connect(owner)
            .changeStatusAvailable(textContractTest.address, userA.address)

        // get user status
        const txForGetUserStatus = await controlContract
            .connect(owner)
            .getTexts(textAddressList, userA.address)

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
        // admin: Contract's owner
        // controller: Person in shiftbase
        // userA, userB: Content learners
        const [admin, controller, userA, userB] = await ethers.getSigners()

        await controlContract.addTextContractAddress(textContractTest.address)
        await expect(
            controlContract.addTextContractAddress(textContractTest.address),
        ).to.be.revertedWith("the address is already added!")
        const textAddressList =
            await controlContract.showTextContractAddressList()

        // grant CONTROLLER_ROLE to controller
        await controlContract
            .connect(admin)
            .grantControllerRole(controller.address)

        // change mint status AVAILABLE
        await controlContract
            .connect(controller)
            .changeStatusAvailable(textContractTest.address, userA.address)

        // check when user without controller role manipulate control contract, reverted
        await expect(
            controlContract
                .connect(userB)
                .changeStatusAvailable(textContractTest.address, userA.address),
        ).to.be.reverted

        // mint
        const tx = await controlContract
            .connect(userA)
            .mint(textContractTest.address)
        tx.wait()
        console.log(`mint result: ${tx}`)

        // get user status
        const txForGetUserStatus = await controlContract
            .connect(controller)
            .getTexts(textAddressList, userA.address)

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
