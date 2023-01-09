// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface ITextContract {
    // ユーザーのミント状況を管理するステータス
    enum MintStatus {
        UNAVAILABLE,
        AVAILABLE,
        DONE
    }

    // struct for text status
    struct TextUserStatus {
        string imageUrl;
        MintStatus mintStatus;
    }

    function getStatus(address user) external view returns (MintStatus status);

    function getTextStatus(address user)
        external
        view
        returns (TextUserStatus memory);

    function changeStatusUnavailable(address user) external;

    function changeStatusAvailable(address user) external;

    function changeStatusDone(address user) external;

    function mint(address user) external returns (MintStatus status);
}
