pragma solidity ^0.8.17;

interface ITextContract {
    // ユーザーのミント状況を管理するステータス
    enum MintStatus {
        Unavailable,
        Available,
        Done
    }

    function getStatus(address user) external view returns (MintStatus status);

    function mint(address user) external returns (MintStatus status);
}