// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import 'hardhat/console.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';

import {Base64Upgradeable} from '@openzeppelin/contracts-upgradeable/utils/Base64Upgradeable.sol';

import './projects/IProject.sol';

contract ProjectsController is
  Initializable,
  AccessControlUpgradeable,
  ERC721URIStorageUpgradeable
{
  // Address list of project contract address
  address[] private _addressList;
  // Setup admin and controller role
  // ADMIN_ROLE can modify and add CONTROLLER_ROLE
  bytes32 public constant ADMIN_ROLE = keccak256('ADMIN_ROLE');
  bytes32 public constant CONTROLLER_ROLE = keccak256('CONTROLLER_ROLE');

  // Mofifier to check if there is no the same address in address list
  modifier onlyNewAddress(address contractAddress) {
    bool doesListContainElement = false;
    for (uint256 i = 0; i < _addressList.length; i++) {
      if (contractAddress == _addressList[i]) {
        doesListContainElement = true;
        break;
      }
    }
    require(doesListContainElement == false, 'the address is already added!');
    _;
  }

  function initialize() public initializer {
    __AccessControl_init();

    // Give admin_role to contract creator; This role allows to add controllers
    _setupRole(ADMIN_ROLE, msg.sender);

    // Give controller_role to contract creator; This role allows to mint tokens
    _setupRole(CONTROLLER_ROLE, msg.sender);

    // Set admin_role as the admin for controller_role; Only default_admin_role can add admins
    _setRoleAdmin(CONTROLLER_ROLE, ADMIN_ROLE);

    console.log('Admin role is grant to: ', msg.sender);
  }

  // This is essential function for upgrade util
  function supportsInterface(
    bytes4 interfaceId
  )
    public
    view
    virtual
    override(ERC721URIStorageUpgradeable, AccessControlUpgradeable)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  function grantControllerRole(address _to) public onlyRole(ADMIN_ROLE) {
    grantRole(CONTROLLER_ROLE, _to);

    // Check if controller role was granted
    _checkRole(CONTROLLER_ROLE, _to);

    console.log('Contorol role granted to: ', _to);
  }

  function addProjectContractAddress(
    address contractAddress
  ) public onlyNewAddress(contractAddress) onlyRole(CONTROLLER_ROLE) {
    _addressList.push(contractAddress);
  }

  function getAllProjectInfo()
    public
    view
    onlyRole(CONTROLLER_ROLE)
    returns (
      address[] memory projectAddresses,
      string[] memory projectNames,
      string[] memory passportHashes
    )
  {
    uint256 length = _addressList.length;
    projectNames = new string[](length);
    passportHashes = new string[](length);

    // Get information from each project contract
    for (uint8 i; i < length; i++) {
      // Add project information
      projectNames[i] = IProject(_addressList[i]).getProjectName();
      passportHashes[i] = IProject(_addressList[i]).getPassportHash();
    }

    return (_addressList, projectNames, passportHashes);
  }

  function getUserProjectInfoAll(
    address user
  )
    public
    view
    returns (
      address[] memory projectAddresses,
      string[] memory passportHashes,
      IProject.MintStatus[] memory mintStatuses
    )
  {
    uint256 length = _addressList.length;
    passportHashes = new string[](length);
    mintStatuses = new IProject.MintStatus[](length);

    // Get information from each project contract
    for (uint8 i; i < length; i++) {
      // Add UserProjectInfo
      passportHashes[i] = IProject(_addressList[i]).getPassportHash();
      mintStatuses[i] = IProject(_addressList[i]).getUserMintStatus(user);
    }

    return (_addressList, passportHashes, mintStatuses);
  }

  function getUserMintStatus(
    address contractAddress,
    address user
  ) public view onlyRole(CONTROLLER_ROLE) returns (IProject.MintStatus) {
    return (IProject(contractAddress).getUserMintStatus(user));
  }

  function changeStatusToUnavailable(
    address contractAddress,
    address user
  ) public onlyRole(CONTROLLER_ROLE) {
    IProject(contractAddress).changeStatusToUnavailable(user);
  }

  function changeStatusToAvailable(
    address contractAddress,
    address user
  ) public onlyRole(CONTROLLER_ROLE) {
    IProject(contractAddress).changeStatusToAvailable(user);
  }

  function changeStatusToDone(
    address contractAddress,
    address user
  ) public onlyRole(CONTROLLER_ROLE) {
    IProject(contractAddress).changeStatusToDone(user);
  }

  // This function is called by the project learner.
  function mint(address contractAddress) public {
    IProject(contractAddress).mint(msg.sender);
  }

  function multiMint(
    address[] memory contractAddresses,
    address[] memory recipients
  ) public onlyRole(ADMIN_ROLE) {
    // Check if parameters length is the same
    require(
      recipients.length == contractAddresses.length,
      'Length of data array must be the same.'
    );

    for (uint256 i = 0; i < recipients.length; i++) {
      // Check user mint status
      IProject.MintStatus recipientStatus = IProject(contractAddresses[i])
        .getUserMintStatus(recipients[i]);

      if (recipientStatus == IProject.MintStatus.DONE) {
        console.log('NFT has been already minted to %s', recipients[i]);
      } else {
        IProject(contractAddresses[i]).mintByAdmin(msg.sender, recipients[i]);
      }
    }
  }
}
