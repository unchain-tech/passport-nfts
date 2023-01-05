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
        uint256 textId;
        string imageUrl;
        address user;
        MintStatus mintStatus;
    }

    // get text status of calling user
    function getTextStatus() external returns (TextUserStatus memory);

    // change status to DONE
    function changeStatusDone() external;

    // change status to AVAILABLE
    function changeStatusAvailable() external;

    // change status to UNAVAILABLE
    function changeStatusUnavailable() external;
}

// contract for controling text contract
contract ControlContract is
    Initializable,
    AccessControlUpgradeable,
    ERC721URIStorageUpgradeable
{
    // test valuable
    uint256 private _value;

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
        //     ////////// TOKEN SETUP /////////
        //     __AccessControl_init();
        //     ////////// TOKEN SETUP END //////////
        //     // give default_admin_role to contract creator; this is the starting admin for all roles
        //     _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        //     // give admin_role to contract creator; this role allows to add minters
        //     _setupRole(ADMIN_ROLE, msg.sender);
        //     // give minter_role to contract creator; this role allows to mint tokens
        //     _setupRole(MINTER_ROLE, msg.sender);
        //     // set admin_role as the admin for minter_role; only default_admin_role can add admins
        //     _setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
        //     console.log("Token created! Contract admin: ", msg.sender);
    }

    function contractURI() public pure returns (string memory) {
        string memory contractInfo = string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64Upgradeable.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name": "UNCHAIN Passport: ",',
                            '"description": "Each of the passports in the collection certifies ',
                            "its owner's completion of a specific UNCHAIN web3 development project. It provides its holders immutable and permanent proof of their blockchain engineering capabilities.",
                            '", "image": "',
                            "https://ipfs.io/ipfs/Qmeo5w5UWMTiEVwGfGGsuF1m3XYHQJshpjK7PT86zzsqQB",
                            '"}'
                        )
                    )
                )
            )
        );
        return contractInfo;
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
            ).getTextStatus();
            TextUserStatus memory textUserStatus = TextUserStatus(
                userStatus.textId,
                userStatus.imageUrl,
                userStatus.user,
                (MintStatus)(uint8(userStatus.mintStatus))
            );
            textStatusList[i] = textUserStatus;
        }
        emit getUserStatus(textStatusList);

        return textStatusList;
    }

    // change mint status to DONE
    function changeStatusDone(address contractAddress) public {
        ITextContract(contractAddress).changeStatusDone();
    }

    // change mint status to AVAILABLE
    function changeStatusAvailable(address contractAddress) public {
        ITextContract(contractAddress).changeStatusAvailable();
    }

    // change mint status to UNAVAILABLE
    function changeStatusUnavailable(address contractAddress) public {
        ITextContract(contractAddress).changeStatusUnavailable();
    }

    // function grantAdminRole(address _to)
    //     public
    //     onlyRole(DEFAULT_ADMIN_ROLE)
    //     returns (address)
    // {
    //     // grant admin role to _to
    //     grantRole(ADMIN_ROLE, _to);

    //     // check if admin role was granted
    //     _checkRole(ADMIN_ROLE, _to);

    //     console.log("Admin role granted to: ", _to);

    //     return _to;
    // }

    // function grantMinterRole(address _to)
    //     public
    //     onlyRole(ADMIN_ROLE)
    //     returns (address)
    // {
    //     // grant minter role to _to
    //     grantRole(MINTER_ROLE, _to);

    //     // chek if minter role was granted
    //     _checkRole(MINTER_ROLE, _to);

    //     console.log("Minter role granted to: ", _to);

    //     return _to;
    // }

    // event NewTokenMinted(address sender, address recipient, uint256 tokenId);

    // function mintNFT(
    //     address _recipient,
    //     string memory _projectName,
    //     string memory _passportHash
    // ) public onlyRole(MINTER_ROLE) returns (uint256) {
    //     //create hash from recipient and projectname
    //     bytes32 _hash = keccak256(abi.encodePacked(_recipient, _projectName));

    //     //check if the hash is already used
    //     require(_hashes[_hash] != 1, "NFT already minted to wallet");

    //     //mark the hash as used
    //     _hashes[_hash] = 1;

    //     //Get the current tokenId, this starts at 0.
    //     uint256 newItemId = _tokenIds.current();

    //     //Get the current tokenId, this starts at 0.
    //     bytes memory _attributes;
    //     _attributes = abi.encodePacked(
    //         '"attributes": [{"trait_type": "UNCHAIN Project", "value": "',
    //         _projectName,
    //         '"}]'
    //     );

    //     //Make Json metadata and base 64 encode it.
    //     string memory metadata = Base64Upgradeable.encode(
    //         bytes(
    //             string(
    //                 abi.encodePacked(
    //                     '{"name": "',
    //                     "Unchain Passport: ",
    //                     _projectName,
    //                     '", "description": "',
    //                     "Immutable and permenent proof of your UNCHAIN project completion.",
    //                     '", "image": "',
    //                     "https://ipfs.io/ipfs/",
    //                     _passportHash,
    //                     '",',
    //                     string(_attributes),
    //                     "}"
    //                 )
    //             )
    //         )
    //     );

    //     //prepend data:application/json;base64, to our data.
    //     string memory finalTokenUri = string(
    //         abi.encodePacked("data:application/json;base64,", metadata)
    //     );

    //     //Actually mint the NFT to recipient.
    //     _safeMint(_recipient, newItemId);

    //     //Set the NFTs data.
    //     _setTokenURI(newItemId, finalTokenUri);

    //     console.log(
    //         "ID %s has been minted to %s (initiated by %s)",
    //         newItemId,
    //         _recipient,
    //         msg.sender
    //     );

    //     //Increment the counter for next mint.
    //     _tokenIds.increment();

    //     emit NewTokenMinted(msg.sender, _recipient, newItemId);

    //     return newItemId;
    // }

    // // Emitted when the stored value changes
    // event ValueChanged(uint256 newValue);

    // // Stores a new value in the contract
    // function store(uint256 newValue) public {
    //     _value = newValue;
    //     emit ValueChanged(newValue);
    // }

    // // Reads the last stored value
    // function retrieve() public view returns (uint256) {
    //     return _value;
    // }

    // // Increments the stored value by 1
    // function increment() public {
    //     _value = _value + 1;
    //     emit ValueChanged(_value);
    // }
}
