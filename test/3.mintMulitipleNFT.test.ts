import { expect } from "chai";
import {ethers, upgrades} from "hardhat";
import {Contract, ContractFactory} from "ethers";
import "web3";
import { TransactionDescription } from "ethers/lib/utils";

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
        const [user1, user2, user3, user4] = await ethers.getSigners();
        const _recipients = [user2.address, user3.address, user4.address];
        const _projectNames = ["sapientia", "constantia", "utilitas"];
        const _passportHashes = ["QmSAm1pzAfXxSmjH9bSJbf1WfaDbgsxnstPtj4cbXZathX", "Qmcj4qnFwmTwe63LTw8kkaucqjT3BShwK1yCboq5mdUufe", "QmcJmVow43ESMimrpub9NsWHBvBtbRwyF8L1qKQjzwed5Y"];

        for(var i = 0; i<_recipients.length; i++){
            console.log(`user${i+2}'s address: ${_recipients[i]}`);
        }
        
        // Mint NFT
        const tx = await v1Contract.mintMultipleNFTs_1(_recipients, _projectNames, _passportHashes);

        // select which event to get
        const abi = [
            "event NewMultiNFTMinted((address,uint256)[])"
        ]
        let iface = new ethers.utils.Interface(abi);
        const txData = await tx.wait();
        const lastEventsIndex = txData.events.length-1;
        const lastEventData = txData.events[lastEventsIndex]

        // decode the event's output and display
        console.log(iface.parseLog(lastEventData).args);
    });
});
