import { expect } from 'chai';
import { ethers} from "hardhat";
import { Contract, ContractFactory } from "ethers";

let v1Contract: Contract;

// Start test block
describe('Unchain AccessControl', function () {
    
    // Test case
    it('Access control is working!', async function () {
      const [user1, user2] = await ethers.getSigners();
      const v1Factory:ContractFactory = await ethers.getContractFactory("UNCHAIN_PASSPORT_v01");
      
      v1Contract = await v1Factory.deploy();
      await v1Contract.deployed();
      // show the deployer address
      console.log(user1.address)
      const isAdmin = await v1Contract.checkAdmin(user1.address);
      
      // check if role is set
      expect(isAdmin).to.equal(false);
    });
  });