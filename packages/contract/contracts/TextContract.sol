// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import 'hardhat/console.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';
import {Base64Upgradeable} from '@openzeppelin/contracts-upgradeable/utils/Base64Upgradeable.sol';

import './ITextContract.sol';

contract TextContract is ITextContract, ERC721URIStorageUpgradeable {
  // Token info
  string private _tokenName;
  string private _tokenSymbol;
  string private _tokenDescription;
  string private _imageUrl;
  string private _projectName;
  string private _passportHash;

  using CountersUpgradeable for CountersUpgradeable.Counter;
  CountersUpgradeable.Counter private _tokenIds;

  // Mapping content learners and NFT mint status
  mapping(address => ITextContract.MintStatus) private _userToMintStatus;

  // mint status meets
  modifier onlyAvailable(address _user) {
    ITextContract.TextUserStatus memory textUserStatus = getTextStatus(_user);
    require(
      textUserStatus.mintStatus == ITextContract.MintStatus.AVAILABLE,
      "you're mint status is not AVAILABLE!"
    );
    _;
  }

  function initialize() public initializer {
    // setup token
    _tokenName = 'UNCHAIN Passport';
    _tokenSymbol = 'CHAIPASS';
    _tokenDescription = 'Immutable and permenent proof of your UNCHAIN project completion.';
    // TODO: 学習コンテンツに応じて値を変更
    _imageUrl = 'TEST_URL';
    _projectName = 'test';
    _passportHash = 'test';

    __ERC721_init(_tokenName, _tokenSymbol);

    console.log('Token created!');
  }

  event NewTokenMinted(address sender, address recipient, uint256 tokenId);

  // Return the user's mint status
  function getStatus(
    address user
  ) public view virtual override returns (ITextContract.MintStatus) {
    // If there is no user data, the default value(UNAVAILABLE == 0) is returned
    return _userToMintStatus[user];
  }

  // Return text status
  function getTextStatus(
    address user
  ) public view virtual override returns (TextUserStatus memory) {
    TextUserStatus memory textStatus = TextUserStatus({
      imageUrl: _imageUrl,
      mintStatus: getStatus(user)
    });

    return textStatus;
  }

  // Change mint status to UNAVAILABLE
  function changeStatusUnavailable(address user) public virtual override {
    _userToMintStatus[user] = ITextContract.MintStatus.UNAVAILABLE;
  }

  // Change mint status to AVAILABLE
  function changeStatusAvailable(address user) public virtual override {
    _userToMintStatus[user] = ITextContract.MintStatus.AVAILABLE;
  }

  // Change mint status to DONE
  function changeStatusDone(address user) public virtual override {
    _userToMintStatus[user] = ITextContract.MintStatus.DONE;
  }

  // Mint NFT
  function mint(address user) public virtual override onlyAvailable(user) {
    _tokenIds.increment();

    uint256 newItemId = _tokenIds.current();
    string memory tokenURI = _generateTokenURI();

    // execute mint
    _safeMint(user, newItemId);

    // set JSON data
    _setTokenURI(newItemId, tokenURI);

    // user status change when mint succeed
    changeStatusDone(user);

    // send event
    emit NewTokenMinted(user, user, newItemId);
  }

  // Mint NFT
  // This function is called when ControlContract admin calls multiMint
  function mintByAdmin(
    address sender,
    address recipient
  ) public virtual override {
    _tokenIds.increment();

    uint256 newItemId = _tokenIds.current();

    // execute mint
    _safeMint(recipient, newItemId);

    // TODO 第二引数の値をJSONデータに変更する
    // set JSON data
    _setTokenURI(newItemId, 'TEST');

    // user status change when mint succeed
    changeStatusDone(recipient);

    // send event
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
