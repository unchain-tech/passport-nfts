// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import 'hardhat/console.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';

import {Base64Upgradeable} from '@openzeppelin/contracts-upgradeable/utils/Base64Upgradeable.sol';

import './ITextContract.sol';

// contract for controling text contract
contract ControlContract is
  Initializable,
  AccessControlUpgradeable,
  ERC721URIStorageUpgradeable
{
  struct TextInfo {
    address textContractAddress;
    string passportHash;
  }

  // address list of text contract address
  address[] private _addressList;

  //setup admin and controller role
  //admin can modify and add controllers
  bytes32 public constant ADMIN_ROLE = keccak256('ADMIN_ROLE');
  bytes32 public constant CONTROLLER_ROLE = keccak256('CONTROLLER_ROLE');

  mapping(bytes32 => uint8) private _hashes;

  // event
  event getUserStatus(ITextContract.UserTextInfo[] statusList);

  // mofifier to check if there is no the same address in address list
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

  //NFTs token name and it's symbol
  function initialize() public initializer {
    __AccessControl_init();

    // give admin_role to contract creator; this role allows to add controllers
    _setupRole(ADMIN_ROLE, msg.sender);

    // give controller_role to contract creator; this role allows to mint tokens
    _setupRole(CONTROLLER_ROLE, msg.sender);

    // set admin_role as the admin for controller_role; only default_admin_role can add admins
    _setRoleAdmin(CONTROLLER_ROLE, ADMIN_ROLE);

    console.log('Admin role is grant to: ', msg.sender);
  }

  // this is essential function for upgrade util
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
    // grant controller role to _to
    grantRole(CONTROLLER_ROLE, _to);

    // chek if controller role was granted
    _checkRole(CONTROLLER_ROLE, _to);

    console.log('Contorol role granted to: ', _to);
  }

  function addTextContractAddress(
    address contractAddress
  ) public onlyNewAddress(contractAddress) onlyRole(CONTROLLER_ROLE) {
    _addressList.push(contractAddress);
  }

  function getAllTextInfo()
    public
    view
    onlyRole(CONTROLLER_ROLE)
    returns (TextInfo[] memory)
  {
    uint256 length = _addressList.length;
    TextInfo[] memory AllTextInfo = new TextInfo[](length);

    for (uint256 i = 0; i < length; i++) {
      TextInfo memory textInfo = TextInfo({
        textContractAddress: _addressList[i],
        passportHash: ITextContract(_addressList[i]).getPassportHash()
      });
      AllTextInfo[i] = textInfo;
    }

    return AllTextInfo;
  }

  // get text status list from each text contract
  function getUserTextInfoAll(
    address[] memory textAddressList,
    address user
  )
    public
    onlyRole(CONTROLLER_ROLE)
    returns (ITextContract.UserTextInfo[] memory)
  {
    ITextContract.UserTextInfo[]
      memory UserTextInfoList = new ITextContract.UserTextInfo[](
        textAddressList.length
      );
    for (uint8 i; i < textAddressList.length; i++) {
      ITextContract.UserTextInfo memory userStatus = ITextContract(
        textAddressList[i]
      ).getUserTextInfo(user);
      ITextContract.UserTextInfo memory userTextInfo = ITextContract
        .UserTextInfo(
          userStatus.passportHash,
          (ITextContract.MintStatus)(uint8(userStatus.mintStatus))
        );
      UserTextInfoList[i] = userTextInfo;
    }
    emit getUserStatus(UserTextInfoList);

    return UserTextInfoList;
  }

  function getUserMintStatus(
    address contractAddress,
    address user
  ) public view onlyRole(CONTROLLER_ROLE) returns (ITextContract.MintStatus) {
    return (ITextContract(contractAddress).getUserMintStatus(user));
  }

  // change mint status to UNAVAILABLE
  function changeStatusUnavailable(
    address contractAddress,
    address user
  ) public onlyRole(CONTROLLER_ROLE) {
    ITextContract(contractAddress).changeStatusUnavailable(user);
  }

  // change mint status to AVAILABLE
  function changeStatusAvailable(
    address contractAddress,
    address user
  ) public onlyRole(CONTROLLER_ROLE) {
    ITextContract(contractAddress).changeStatusAvailable(user);
  }

  // change mint status to DONE
  function changeStatusDone(
    address contractAddress,
    address user
  ) public onlyRole(CONTROLLER_ROLE) {
    ITextContract(contractAddress).changeStatusDone(user);
  }

  // Mint NFT
  // this function is called by the content learner.
  function mint(address contractAddress) public {
    ITextContract(contractAddress).mint(msg.sender);
  }

  // Mint NFT to multiple recipients
  function multiMint(
    address[] memory recipients,
    address[] memory contractAddresses
  ) public onlyRole(ADMIN_ROLE) {
    // check if parameters length is the same
    require(
      recipients.length == contractAddresses.length,
      'Length of data array must be the same.'
    );

    for (uint256 i = 0; i < recipients.length; i++) {
      // check user mint status
      ITextContract.MintStatus recipientStatus = ITextContract(
        contractAddresses[i]
      ).getUserMintStatus(recipients[i]);

      if (recipientStatus == ITextContract.MintStatus.DONE) {
        console.log('NFT has been already minted to %s', recipients[i]);
      } else {
        // execute mint
        ITextContract(contractAddresses[i]).mintByAdmin(
          msg.sender,
          recipients[i]
        );
      }
    }
  }
}
