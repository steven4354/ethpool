// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// TODO: compile and test

contract EthPool is Ownable {
    constructor() {
        transferOwnership(tx.origin);
    }
}