// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface IProject {
  // Struct for project status
  struct UserProjectInfo {
    string passportHash;
    MintStatus mintStatus;
  }

  // Status to manage user's mint status
  enum MintStatus {
    UNAVAILABLE,
    AVAILABLE,
    DONE
  }

  function getPassportHash() external view returns (string memory);

  function getUserMintStatus(
    address user
  ) external view returns (MintStatus status);

  function getUserProjectInfo(
    address user
  ) external view returns (UserProjectInfo memory);

  function changeStatusToUnavailable(address user) external;

  function changeStatusToAvailable(address user) external;

  function changeStatusToDone(address user) external;

  function mint(address user) external;

  // This function is called when ControlContract admin calls multiMint
  function mintByAdmin(address sender, address recipient) external;
}
