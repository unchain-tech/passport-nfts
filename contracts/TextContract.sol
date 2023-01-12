// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

import "./ITextContract.sol";

contract TextContract is
    ITextContract,
    ERC721URIStorageUpgradeable
{
    // Token info
    string private _tokenName;
    string private _tokenSymbol;
    string private _imageUrl;
    // string private _projectName;
    // string private _passportHash;

    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _tokenIds;

    // Mapping content learners and NFT mint status
    mapping(address => ITextContract.MintStatus) private _userToMintStatus;

    // mint status meets
    modifier onlyAvailable(address _user) {
        ITextContract.TextUserStatus memory textUserStatus = getTextStatus(
            _user
        );
        require(
            textUserStatus.mintStatus == ITextContract.MintStatus.AVAILABLE,
            "you're mint status is not AVAILABLE!"
        );
        _;
    }

    function initialize() public initializer {
        // setup token
        _tokenName = "UNCHAIN Passport";
        _tokenSymbol = "CHAIPASS";
        // TODO 後で変更
        _imageUrl = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiSutRv6L5RQqJdXp7Zc1JNAADwmgX3m0KMH52WympELsarGJcsKzwAp-ve1EcPOWa-iAl6XFcJX4yB6fwOkrkUPLCjetYZqzvL6GyJus2W4AkTy8-bKfVkD-48JXzLU31IivMXiYDJbJ0lDGn5-O4NV9AY7uP8OfHR18nuRmNIWrqIJ-B0fZc9TjFV8A/s867/eto_usagi_fukubukuro.png";
        // // TODO 後で変更
        // _projectName = "Test";
        // // TODO 後で変更
        // _passportHash = "test";

        __ERC721_init(_tokenName, "CHAIPASS");

        console.log("Token created!");
    }

    // Return the user's mint status
    function getStatus(address user)
        public
        view
        virtual
        override
        returns (ITextContract.MintStatus)
    {
        // If there is no user data, the default value(UNAVAILABLE == 0) is returned
        return _userToMintStatus[user];
    }

    // Return text status
    function getTextStatus(address user)
        public
        view
        virtual
        override
        returns (TextUserStatus memory)
    {
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

    event NewTokenMinted(address sender, address recipient, uint256 tokenId);

    // Mint NFT
    function mint(address user)
        public
        virtual
        override
        onlyAvailable(user)
        returns (ITextContract.MintStatus)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();

        // execute mint
        _safeMint(user, newItemId);

        // TODO 第二引数の値をJSONデータに変更する
        // set JSON data
        _setTokenURI(newItemId, "TEST");

        // user status change when mint succeed
        _userToMintStatus[user] = ITextContract.MintStatus.DONE;

        // send event
        emit NewTokenMinted(user, user, newItemId);

        return _userToMintStatus[user];
    }
}
