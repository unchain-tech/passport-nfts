pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "./ITextContract.sol";

contract TextContract is
    ITextContract,
    ERC721Upgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _tokenIdCounter;

    // ユーザーとNFTミント状況をマッピング
    mapping(address => ITextContract.MintStatus) private _userToMintStatus;

    function initialize() public initializer {
        // TODO トークン名とシンボルをセット
        // tokenName = "UNCHAIN Passport";
        // tokenSymbol = "CHAIPASS";
        _ERC721_init("", "");
    }

    // NFTのミント状況を返す関数
    function getStatus(address user)
        public
        view
        virtual
        override
        returns (ITextContract.MintStatus) {
            // TODO 既存のデータ（v2までで既に配布済み）はどうやって扱うか

            // ユーザーのデータがない場合は、デフォルト値(enum: 0 == Unavailable)が返る
            return _userToMintStatus[user];
    }

    // NFTをミントする関数
    // TODO safeMintに変えても良いかも（_safeMintの使用を明らかにするため）
    function mint(address user)
        public
        virtual
        override
        returns (ITextContract.MintStatus) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _safeMint(user, tokenId);

            // mint成功時、ユーザーのステータス変更
            _userToMintStatus[user] = ITextContract.MintStatus.Done;
            return _userToMintStatus[user];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}