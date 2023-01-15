import { expect } from "chai"
import { ethers, upgrades } from "hardhat"
import { Contract, ContractFactory } from "ethers"

let v1Contract: Contract

// Start test block
describe("Unchain AccessControl", function () {
    beforeEach(async function () {
        const v1Factory: ContractFactory = await ethers.getContractFactory(
            "UNCHAIN_PASSPORT_v01",
        )
        v1Contract = await upgrades.deployProxy(v1Factory, [42], {
            initializer: "initialize",
        })
        await v1Contract.deployed()
    })

    // Test case
    it("Access control is working!", async function () {
        const [user1] = await ethers.getSigners()

        // show the deployer address
        const ADMIN_ROLE = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("ADMIN_ROLE"),
        )
        const isAdmin = await v1Contract.hasRole(ADMIN_ROLE, user1.address)
        // check if role is set
        expect(isAdmin).to.equal(true)
    })
})
