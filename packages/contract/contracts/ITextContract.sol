// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface ITextContract {
  // Status to manage user's mint status
  enum MintStatus {
    UNAVAILABLE,
    AVAILABLE,
    DONE
  }

  // Struct for text status
  struct TextUserStatus {
    string passportHash;
    MintStatus mintStatus;
  }

  // Get mint status of user
  function getStatus(address user) external view returns (MintStatus status);

  // Get text status of calling user
  function getTextStatus(
    address user
  ) external view returns (TextUserStatus memory);

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
