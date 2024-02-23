// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface IProject {
    // Status to manage user's mint status
    enum MintStatus {
        UNAVAILABLE,
        AVAILABLE,
        DONE
    }

    function getProjectName() external view returns (string memory);

    function getPassportHash() external view returns (string memory);

    function getUserMintStatus(
        address user
    ) external view returns (MintStatus status);

    function changeStatusToUnavailable(address user) external;

    function changeStatusToAvailable(address user) external;

    function changeStatusToDone(address user) external;

    function mint(address user) external;

    // This function is called when ProjectsController admin calls multiMint
    function mintByAdmin(address sender, address recipient) external;
}
