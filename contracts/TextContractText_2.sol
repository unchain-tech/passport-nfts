// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

import {Base64Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/Base64Upgradeable.sol";

interface IControlContract {
    function getTextId() external view returns (uint256 textId);

    function incrementTextId() external;
}

contract TextContractTest_2 is
    Initializable,
    AccessControlUpgradeable,
    ERC721URIStorageUpgradeable
{
    // own text id
    uint256 private _textId;

    // text image URL
    string private _imgUrl;

    // enum for checking mint status
    enum MintStatus {
        UNAVAILABLE,
        AVAILABLE,
        DONE
    }

    // struct for text status
    struct TextUserStatus {
        uint256 textId;
        string imageUrl;
        address user;
        MintStatus mintStatus;
    }

    // user text status list
    mapping(address => MintStatus) private _userStatusMap;

    // constructor
    function initialize(address controlContractAddress) public initializer {
        _textId = IControlContract(controlContractAddress).getTextId();
        _imgUrl = "https://e7.pngegg.com/pngimages/84/586/png-clipart-brown-2-illustration-golden-number-2-miscellaneous-numbers-thumbnail.png";
        IControlContract(controlContractAddress).incrementTextId();
    }

    // this is essential function for upgrade util
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // return text id
    function showTextId() public view returns (uint256 textId) {
        return _textId;
    }

    // get text status
    function getTextStatus() external view returns (TextUserStatus memory) {
        TextUserStatus memory myTextStatus = TextUserStatus({
            textId: _textId,
            imageUrl: _imgUrl,
            user: msg.sender,
            mintStatus: _userStatusMap[msg.sender]
        });

        return myTextStatus;
    }

    // change mint status to DONE
    // TODO add modifier to check if sender has already minted
    function changeStatusDone() external {
        _userStatusMap[msg.sender] = MintStatus.DONE;
    }

    // change mint status to AVAILABLE
    // TODO add modifier to check if sender has not already minted but has mint right
    function changeStatusAvailable() external {
        _userStatusMap[msg.sender] = MintStatus.AVAILABLE;
    }

    // change mint status to UNAVAILABLE
    // TODO add modifier to check if sender doesn't hava mint right
    function changeStatusUnavailable() external {
        _userStatusMap[msg.sender] = MintStatus.UNAVAILABLE;
    }
}
