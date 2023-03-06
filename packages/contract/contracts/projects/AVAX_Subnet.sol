// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';
import {Base64Upgradeable} from '@openzeppelin/contracts-upgradeable/utils/Base64Upgradeable.sol';

import './IProject.sol';

contract AVAX_Subnet is IProject, ERC721URIStorageUpgradeable {
  // Token info
  string private _tokenName;
  string private _tokenSymbol;
  string private _tokenDescription;
  string private _imageUrl;
  string private _projectName;
  string private _passportHash;

  using CountersUpgradeable for CountersUpgradeable.Counter;
  CountersUpgradeable.Counter private _tokenIds;

  // Mapping learner's address and NFT mint status
  mapping(address => IProject.MintStatus) private _userToMintStatus;

  event NewTokenMinted(address sender, address recipient, uint256 tokenId);

  // Mint status meets
  modifier onlyAvailable(address _user) {
    IProject.MintStatus status = getUserMintStatus(_user);
    require(
      status == IProject.MintStatus.AVAILABLE,
      "you're mint status is not AVAILABLE!"
    );
    _;
  }

  function initialize() public initializer {
    // Setup token
    _tokenName = 'UNCHAIN Passport';
    _tokenSymbol = 'CHAIPASS';
    _tokenDescription = 'Immutable and permanent proof of your UNCHAIN project completion.';
    _projectName = 'AVAX Subnet';
    _passportHash = 'QmUbCiH4NDbn3z4QPKXTyESK9SVhqGDQzfvrVfjufnWwnx';

    __ERC721_init(_tokenName, _tokenSymbol);
  }

  function getProjectName() public view returns (string memory) {
    return _projectName;
  }

  function getPassportHash() public view returns (string memory) {
    return _passportHash;
  }

  function getUserMintStatus(
    address user
  ) public view virtual override returns (IProject.MintStatus) {
    // If there is no user data, the default value(UNAVAILABLE == 0) is returned
    return _userToMintStatus[user];
  }

  function changeStatusToUnavailable(address user) public virtual override {
    _userToMintStatus[user] = IProject.MintStatus.UNAVAILABLE;
  }

  function changeStatusToAvailable(address user) public virtual override {
    _userToMintStatus[user] = IProject.MintStatus.AVAILABLE;
  }

  function changeStatusToDone(address user) public virtual override {
    _userToMintStatus[user] = IProject.MintStatus.DONE;
  }

  function mint(address user) public virtual override onlyAvailable(user) {
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();
    string memory tokenURI = _generateTokenURI();

    _safeMint(user, newItemId);
    _setTokenURI(newItemId, tokenURI);
    changeStatusToDone(user);

    emit NewTokenMinted(user, user, newItemId);
  }

  // This function is called when ProjectsController admin calls multiMint
  function mintByAdmin(
    address sender,
    address recipient
  ) public virtual override {
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();
    string memory tokenURI = _generateTokenURI();

    _safeMint(recipient, newItemId);
    _setTokenURI(newItemId, tokenURI);
    changeStatusToDone(recipient);

    emit NewTokenMinted(sender, recipient, newItemId);
  }

  function _generateTokenURI() private view returns (string memory) {
    // Make Json metadata and base 64 encode it.
    bytes memory _attributes;
    _attributes = abi.encodePacked(
      '"attributes": [{"trait_type": "UNCHAIN Project", "value": "',
      _projectName,
      '"}]'
    );

    string memory metadata = Base64Upgradeable.encode(
      bytes(
        abi.encodePacked(
          '{"name": "',
          _tokenName,
          ': ',
          _projectName,
          '", "description": "',
          _tokenDescription,
          '", "image": "',
          'https://ipfs.io/ipfs/',
          _passportHash,
          '",',
          string(_attributes),
          '}'
        )
      )
    );
    string memory tokenURI = string(
      abi.encodePacked('data:application/json;base64,', metadata)
    );

    return tokenURI;
  }
}
