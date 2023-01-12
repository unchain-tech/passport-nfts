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

    // get text status of calling user
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
    address[] private _addressList;

    //setup admin and controller role
    //admin can modify and add controllers
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant CONTROLLER_ROLE = keccak256("CONTROLLER_ROLE");

    mapping(bytes32 => uint8) private _hashes;

    // event
    event getUserStatus(TextUserStatus[] statusList);

    // mofifier to check if there is no the same address in address list
    modifier onlyNewAddress(address contractAddress) {
        bool doesListContainElement = false;
        for (uint256 i = 0; i < _addressList.length; i++) {
            if (contractAddress == _addressList[i]) {
                doesListContainElement = true;
                break;
            }
        }
        require(
            doesListContainElement == false,
            "the address is already added!"
        );
        _;
    }

    //NFTs token name and it's symbol
    function initialize() public initializer {
        __AccessControl_init();

        // give admin_role to contract creator; this role allows to add controllers
        _setupRole(ADMIN_ROLE, msg.sender);

        // give controller_role to contract creator; this role allows to mint tokens
        _setupRole(CONTROLLER_ROLE, msg.sender);

        // set admin_role as the admin for controller_role; only default_admin_role can add admins
        _setRoleAdmin(CONTROLLER_ROLE, ADMIN_ROLE);

        console.log("Admin role is grant to: ", msg.sender);
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

    function grantControllerRole(address _to)
        public
        onlyRole(ADMIN_ROLE)
        returns (address)
    {
        // grant controller role to _to
        grantRole(CONTROLLER_ROLE, _to);

        // chek if controller role was granted
        _checkRole(CONTROLLER_ROLE, _to);

        console.log("Contorol role granted to: ", _to);

        return _to;
    }

    function addTextContractAddress(address contractAddress)
        public
        onlyNewAddress(contractAddress)
        onlyRole(CONTROLLER_ROLE)
    {
        _addressList.push(contractAddress);
    }

    // for testing to check this contract can get text contract address
    // TODO delete when development is done
    function showTextContractAddressList()
        public
        view
        onlyRole(CONTROLLER_ROLE)
        returns (address[] memory)
    {
        return _addressList;
    }

    // get text status list from each text contract
    function getTexts(address[] memory textAddressList)
        public
        onlyRole(CONTROLLER_ROLE)
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
    function changeStatusUnavailable(address contractAddress)
        public
        onlyRole(CONTROLLER_ROLE)
    {
        ITextContract(contractAddress).changeStatusUnavailable(msg.sender);
    }

    // change mint status to AVAILABLE
    function changeStatusAvailable(address contractAddress)
        public
        onlyRole(CONTROLLER_ROLE)
    {
        ITextContract(contractAddress).changeStatusAvailable(msg.sender);
    }

    // change mint status to DONE
    function changeStatusDone(address contractAddress)
        public
        onlyRole(CONTROLLER_ROLE)
    {
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
        onlyRole(CONTROLLER_ROLE)
        returns (ITextContract.MintStatus)
    {
        return (ITextContract(contractAddress).getStatus(msg.sender));
    }
}
