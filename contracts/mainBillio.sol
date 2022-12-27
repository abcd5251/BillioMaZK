// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[6] memory input // publicSignals
    ) external view returns (bool r);
}

contract mainBillio{
    uint256 public maxPeople;
    address public owner;
    bool public logging;

    IVerifier public verifier;

    constructor (address _instance) {
        verifier = IVerifier(_instance);
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

    function login(string memory _name, string memory _idcommitment) public onlyOwner{
        require(!secret_name[_idcommitment],"Password already used!");
        secret_name[_idcommitment] = true;
        maxPeople++;
        domains[maxPeople] =  Domain(_name, 0, maxPeople);
    }

    function add_asset(string memory _hash_address, uint256 _amount) public haslogin{
        require(!hash_addresses[_hash_address],"Address already used!");
        domains[maxPeople].asset = domains[maxPeople].asset + _amount;
    }

    function getDomain(uint256 _id) public view returns (Domain memory){
        return domains[_id];
    }
}
