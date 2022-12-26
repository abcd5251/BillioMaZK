// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract mainBillio{
    uint256 public maxSupply;
    address public owner;

    struct Domain{
        string name;
        uint256 asset;
        bool isOwned;
    }
    mapping(uint256 => Domain) domains;
    
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
}
