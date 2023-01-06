pragma solidity ^0.8.17;

interface ITextContract {
    // ユーザーのミント状況を管理するステータス
    enum MintStatus {
        Unavailable,
        Available,
        Done
    }

    function getStatus() external view returns (MintStatus status);
    function changeStatusAvailable() external;
    function mint() external returns (MintStatus status);
}