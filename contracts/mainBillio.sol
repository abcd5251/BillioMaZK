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
    mapping(string => bool) account_name;

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
        require(!account_name[_name], "Account Name already used!");
        secret_name[_id] = true;
        domains[maxPeople] =  Domain(_name, 0, maxPeople);
        logging = true;
    }

    function add_asset(string memory _hash_address, uint256 _amount) public haslogin{
        require(!hash_addresses[_hash_address],"Address already used!");
        domains[maxPeople].asset = domains[maxPeople].asset + _amount;
        hash_addresses[_hash_address] = true;
    }

    function getDomain(uint256 _id) public view returns (Domain memory){
        return domains[_id];
    }

    function save_asset() public haslogin{
        logging = false;
        maxPeople++;
    }



    function setfordemo() public onlyOwner{
        domains[maxPeople] =  Domain("Bob", 15, maxPeople);
        maxPeople++;
        domains[maxPeople] =  Domain("Alice", 10, maxPeople);
        maxPeople++;
        domains[maxPeople] =  Domain("Tom", 8, maxPeople);
        maxPeople++;
        domains[maxPeople] =  Domain("Tiffany", 6, maxPeople);
        maxPeople++;
        domains[maxPeople] =  Domain("Leo", 3, maxPeople);
        maxPeople++;
        domains[maxPeople] =  Domain("David", 7, maxPeople);
        maxPeople++;
    }
}
