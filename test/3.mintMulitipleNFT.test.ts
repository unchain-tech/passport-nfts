import { expect } from "chai";
import {ethers, upgrades} from "hardhat";
import {Contract, ContractFactory} from "ethers";

let v1Contract: Contract;

// Start test block
describe("Mint multiple NFT", function(){
    beforeEach(async function(){
        const v1Factory: ContractFactory = await ethers.getContractFactory("UNCHAIN_PASSPORT_v01");
        v1Contract = await upgrades.deployProxy(v1Factory, [42], {initializer: 'initialize'});
        await v1Contract.deployed();
        console.log(`contract address: ${v1Contract.address}`)
    });

    // Test case
    it("Succeeded to mint multiple NFT!", async function(){
        const [user1, user2, user3] = await ethers.getSigners();
        const _recipients = [user2.address, user3.address];
        const _projectNames = ["sapientia", "constantia"];
        const _passportHashes = ["QmSAm1pzAfXxSmjH9bSJbf1WfaDbgsxnstPtj4cbXZathX", "Qmcj4qnFwmTwe63LTw8kkaucqjT3BShwK1yCboq5mdUufe"];

        for(var i = 0; i<_recipients.length; i++){
            console.log(`user${i+2}'s address: ${_recipients[i]}`);
        }
        
        // Mint NFT
        const userInfo = await v1Contract.mintMultipleNFTs_1(_recipients, _projectNames, _passportHashes);
        console.log(userInfo.newItemId);

        
        
    });
});
