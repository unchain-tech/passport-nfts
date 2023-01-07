pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

import "./ITextContract.sol";

contract TextContract is
    ITextContract,
    AccessControlUpgradeable,
    ERC721URIStorageUpgradeable
{
    // Token info
    string public tokenName;
    string public tokenSymbol;

    //Setup admin and minter role
    //admin can modify and add minters
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _tokenIds;

    // ユーザーとNFTミント状況をマッピング
    mapping(address => ITextContract.MintStatus) private _userToMintStatus;

    function initialize() public initializer {
        // トークン名とシンボルをセット
        ////////// TOKEN SETUP /////////
        tokenName = "UNCHAIN Passport";
        tokenSymbol = "CHAIPASS";

        __ERC721_init(tokenName, "CHAIPASS");
        __AccessControl_init();

         ////////// TOKEN SETUP END //////////

        // give default_admin_role to contract creator; this is the starting admin for all roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

        // give admin_role to contract creator; this role allows to add minters
        _setupRole(ADMIN_ROLE, msg.sender);

        // give minter_role to contract creator; this role allows to mint tokens
        _setupRole(MINTER_ROLE, msg.sender);

        // set admin_role as the admin for minter_role; only default_admin_role can add admins
        _setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);

        console.log("Token created! Contract admin: ", msg.sender);
    }

    // NFTのミント状況を返す関数
    function getStatus(address user)
        public
        view
        virtual
        override
        returns (ITextContract.MintStatus) {
            // TODO delete
            console.log("getStatus msg.sender: ", msg.sender);
            console.log("getStatus param:", user);

            // ユーザーのデータがない場合は、デフォルト値(enum: 0 == UNAVAILABLE)が返る
            return _userToMintStatus[user];
    }

    // change mint status to UNAVAILABLE
    function changeStatusUnavailable(address user)
        public
        virtual
        override
    {
        console.log("changeStatusUnavailable param:", user);

        _userToMintStatus[user] = ITextContract.MintStatus.UNAVAILABLE;
    }

    // change mint status to AVAILABLE
    function changeStatusAvailable(address user)
        public
        virtual
        override
    {
        console.log("changeStatusAvailable param:", user);
        
        _userToMintStatus[user] = ITextContract.MintStatus.AVAILABLE;
    }

    // change mint status to DONE
    function changeStatusDone(address user)
        public
        virtual
        override
    {
        console.log("changeStatusDone param:", user);

         _userToMintStatus[user] = ITextContract.MintStatus.DONE;
    }

    // // NFTをミントする関数
    // // TODO safeMintに変えても良いかも（_safeMintの使用を明らかにするため）
    // function mint(string memory tokenURI)
    //     public
    //     virtual
    //     override
    //     returns (ITextContract.MintStatus) {
    //         _tokenIds.increment();

    //         uint256 newItemId = _tokenIds.current();
    //         _safeMint(msg.sender, newItemId);
    //         _setTokenURI(newItemId, tokenURI);

    //         // mint成功時、ユーザーのステータス変更
    //         _userToMintStatus[msg.sender] = ITextContract.MintStatus.Done;
    //         return _userToMintStatus[msg.sender];
    // }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}