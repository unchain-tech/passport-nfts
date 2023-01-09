// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

import {Base64Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/Base64Upgradeable.sol";

// this is for cross contract call
interface ITextContract {
    // enum for checking mint status
    enum MintStatus {
        UNAVAILABLE,
        AVAILABLE,
        DONE
    }

    // struct for text status
    struct TextUserStatus {
        string imageUrl;
        MintStatus mintStatus;
    }

    // // get text status of calling user
    function getTextStatus(address user)
        external
        returns (TextUserStatus memory);

    // change status to DONE
    function changeStatusDone(address user) external;

    // change status to AVAILABLE
    function changeStatusAvailable(address user) external;

    // change status to UNAVAILABLE
    function changeStatusUnavailable(address user) external;

    // mint
    function mint(address user) external returns (MintStatus);

    // // give mint right
    // function giveMintRight() external view returns (MintStatus);

    function getStatus(address user) external view returns (MintStatus);
}

// contract for controling text contract
contract ControlContract is
    Initializable,
    AccessControlUpgradeable,
    ERC721URIStorageUpgradeable
{
    // enum for checking mint status
    enum MintStatus {
        UNAVAILABLE,
        AVAILABLE,
        DONE
    }

    // struct for text status
    struct TextUserStatus {
        string imageUrl;
        MintStatus mintStatus;
    }

    // address list of text contract address
    address[] addressList;

    //setup admin and minter role
    //admin can modify and add minters
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // textId for new text
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _textId;
    mapping(bytes32 => uint8) private _hashes;

    // event
    event getUserStatus(TextUserStatus[] statusList);

    //NFTs token name and it's symbol
    function initialize() public initializer {
        _textId.increment();
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

    // TODO: add modifier to check that the same text contract doesn't run this function
    // get text ID
    function getTextId() external view returns (uint256 textId) {
        return _textId.current();
    }

    // TODO: add modifier to check that the same text contract doesn't run this function
    // increment textId
    function incrementTextId() external {
        _textId.increment();
    }

    // this function is done in frontend manually
    // TODO talk with ysaito if this function is needed
    function addTextContractAddress(address contractAddress) public {
        addressList.push(contractAddress);
    }

    // for testing to check this contract can get text contract address
    // TODO delete when development is done
    function showTextContractAddressList()
        public
        view
        returns (address[] memory)
    {
        return addressList;
    }

    // get text status list from each text contract
    function getTexts(address[] memory textAddressList)
        public
        returns (TextUserStatus[] memory)
    {
        TextUserStatus[] memory textStatusList = new TextUserStatus[](
            textAddressList.length
        );
        for (uint8 i; i < textAddressList.length; i++) {
            ITextContract.TextUserStatus memory userStatus = ITextContract(
                textAddressList[i]
            ).getTextStatus(msg.sender);
            TextUserStatus memory textUserStatus = TextUserStatus(
                userStatus.imageUrl,
                (MintStatus)(uint8(userStatus.mintStatus))
            );
            textStatusList[i] = textUserStatus;
        }
        emit getUserStatus(textStatusList);

        return textStatusList;
    }

    // change mint status to UNAVAILABLE
    function changeStatusUnavailable(address contractAddress) public {
        ITextContract(contractAddress).changeStatusUnavailable(msg.sender);
    }

    // change mint status to AVAILABLE
    function changeStatusAvailable(address contractAddress) public {
        ITextContract(contractAddress).changeStatusAvailable(msg.sender);
    }

    // change mint status to DONE
    function changeStatusDone(address contractAddress) public {
        ITextContract(contractAddress).changeStatusDone(msg.sender);
    }

    function mint(address contractAddress)
        public
        returns (ITextContract.MintStatus)
    {
        return (ITextContract(contractAddress).mint(msg.sender));
    }

    function getStatus(address contractAddress)
        public
        view
        returns (ITextContract.MintStatus)
    {
        return (ITextContract(contractAddress).getStatus(msg.sender));
    }
}
