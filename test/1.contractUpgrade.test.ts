// Load dependencies
import { expect } from "chai"
import { ethers, upgrades } from "hardhat"
import { Contract, ContractFactory } from "ethers"

let v1Contract: Contract
let v2Contract: Contract

// Start test block
describe("Unchain (proxy)", function () {
    beforeEach(async function () {
        const v1Factory: ContractFactory = await ethers.getContractFactory(
            "UNCHAIN_PASSPORT_v01",
        )
        const v2Factory: ContractFactory = await ethers.getContractFactory(
            "UNCHAIN_PASSPORT_v02",
        )
        v1Contract = await upgrades.deployProxy(v1Factory, [42], {
            initializer: "initialize",
        })
        v2Contract = await upgrades.upgradeProxy(v1Contract.address, v2Factory)
        await v2Contract.deployed()
    })

    // Test case
    it("retrieve returns a value previously incremented", async function () {
        // Store a value
        await v2Contract.increment()

        // Test if the returned value is the same one
        // Note that we need to use strings to compare the 256 bit integers
        expect((await v2Contract.retrieve()).toString()).to.equal("43")
    })
})
