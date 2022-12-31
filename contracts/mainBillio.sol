// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;


contract mainBillio{
    uint256 public maxPeople;
    address public owner;
    bool public logging;
    

    constructor () {
        owner = msg.sender;
    }

    struct Domain{
        string show_name; 
        uint256 asset;
        uint256 idx;  // Merkletree position of leaf 
    }
    mapping(uint256 => Domain) domains;
    mapping(string => bool) secret_name; // leaf in merkle tree
    mapping(string => bool) hash_addresses;

    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }

    modifier haslogin(){
        require(logging == true);
        _;
    }

    function login(string memory _name, string memory _id) public onlyOwner{
        require(!secret_name[_id],"Password already used!");
        secret_name[_id] = true;
        maxPeople++;
        domains[maxPeople] =  Domain(_name, 0, maxPeople);
        logging = true;
    }

    function add_asset(string memory _hash_address, uint256 _amount) public haslogin{
        require(!hash_addresses[_hash_address],"Address already used!");
        domains[maxPeople].asset = domains[maxPeople].asset + _amount;
    }

    function getDomain(uint256 _id) public view returns (Domain memory){
        return domains[_id];
    }
}
