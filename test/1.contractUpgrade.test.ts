// Load dependencies
const { expect } = require('chai');
const { ethers, upgrades } = require("hardhat");
import { UNCHAINPASSPORTTEST} from "../typechain";
import { UNCHAINPASSPORT} from "../typechain";

let unchainTest: UNCHAINPASSPORTTEST;
let unchain: UNCHAINPASSPORT;

 
// Start test block
describe('Unchain (proxy)', function () {
    

  beforeEach(async function () {
    const UnchainTest = await ethers.getContractFactory("UNCHAIN_PASSPORT_TEST");
    const Unchain = await ethers.getContractFactory("UNCHAIN_PASSPORT");

    unchainTest = await upgrades.deployProxy(UnchainTest, [42], {initializer: 'store'});
    unchain = await upgrades.upgradeProxy(unchainTest.address, Unchain);
    await unchain.deployed();
  });
 
  // Test case
  it('retrieve returns a value previously incremented', async function () {
    // Store a value
    await unchain.increment();
 
    // Test if the returned value is the same one
    // Note that we need to use strings to compare the 256 bit integers
    expect((await unchain.retrieve()).toString()).to.equal('43');
  });
});