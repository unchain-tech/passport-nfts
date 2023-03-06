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
  struct ProjectInfo {
    address projectContractAddress;
    string passportHash;
  }

  // Address list of project contract address
  address[] private _addressList;
  // Setup admin and controller role
  // ADMIN_ROLE can modify and add CONTROLLER_ROLE
  bytes32 public constant ADMIN_ROLE = keccak256('ADMIN_ROLE');
  bytes32 public constant CONTROLLER_ROLE = keccak256('CONTROLLER_ROLE');

  event getUserStatus(IProject.UserProjectInfo[] statusList);

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
    override(ERC721Upgradeable, AccessControlUpgradeable)
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
    returns (ProjectInfo[] memory)
  {
    uint256 length = _addressList.length;
    ProjectInfo[] memory AllProjectInfo = new ProjectInfo[](length);

    // Get ProjectInfo from each project contract
    for (uint256 i = 0; i < length; i++) {
      ProjectInfo memory projectInfo = ProjectInfo({
        projectContractAddress: _addressList[i],
        passportHash: IProject(_addressList[i]).getPassportHash()
      });
      // Add ProjectInfo
      AllProjectInfo[i] = projectInfo;
    }

    return AllProjectInfo;
  }

  function getUserProjectInfoAll(
    address[] memory projectAddressList,
    address user
  ) public returns (IProject.UserProjectInfo[] memory) {
    uint256 length = projectAddressList.length;
    IProject.UserProjectInfo[]
      memory UserProjectInfoList = new IProject.UserProjectInfo[](length);

    // Get UserProjectInfo from each project contract
    for (uint8 i; i < length; i++) {
      IProject.UserProjectInfo memory userProjectInfo = IProject(
        projectAddressList[i]
      ).getUserProjectInfo(user);
      // Add UserProjectInfo
      UserProjectInfoList[i] = userProjectInfo;
    }
    emit getUserStatus(UserProjectInfoList);

    return UserProjectInfoList;
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
    address[] memory recipients,
    address[] memory contractAddresses
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
