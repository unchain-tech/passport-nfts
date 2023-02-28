// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface IProject {
  // Status to manage user's mint status
  enum MintStatus {
    UNAVAILABLE,
    AVAILABLE,
    DONE
  }

  // Struct for project status
  struct UserProjectInfo {
    string passportHash;
    MintStatus mintStatus;
  }

  function getPassportHash() external view returns (string memory);

  // Get mint status of user
  function getUserMintStatus(
    address user
  ) external view returns (MintStatus status);

  // Get project status of calling user
  function getUserProjectInfo(
    address user
  ) external view returns (UserProjectInfo memory);

  // Change status to UNAVAILABLE
  function changeStatusUnavailable(address user) external;

  // Change status to AVAILABLE
  function changeStatusAvailable(address user) external;

  // Change status to DONE
  function changeStatusDone(address user) external;

  // Mint NFT
  function mint(address user) external;

  // Mint NFT
  // This function is called when ControlContract admin calls multiMint
  function mintByAdmin(address sender, address recipient) external;
}
