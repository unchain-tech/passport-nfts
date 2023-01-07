pragma solidity ^0.8.17;

interface ITextContract {
    // ユーザーのミント状況を管理するステータス
    enum MintStatus {
        UNAVAILABLE,
        AVAILABLE,
        DONE
    }

    function getStatus(address user) external view returns (MintStatus status);
    function changeStatusUnavailable(address user) external;
    function changeStatusAvailable(address user) external;
    function changeStatusDone(address user) external;
    // function mint(string memory tokenURI) external returns (MintStatus status);
}