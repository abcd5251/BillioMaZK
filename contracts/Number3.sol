// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./base/ERC721.sol";

interface IVerifier16{
    function verifyProof(uint[2] memory a, uint[2][2] memory b,uint[2] memory c,uint[4] memory input) external;
}

contract Number3 is ERC721{
    uint public MAX = 10000; 
    IVerifier16 verifier;
    
    constructor(string memory name_, string memory symbol_, address _verifier) ERC721(name_, symbol_){
        verifier = IVerifier16(_verifier);
    }

    
    function _baseURI() internal pure override returns (string memory) {
        return "https://ipfs.io/ipfs/QmR6r5mnU3LHRFojq6c1RAjfyGC8GQurgApBKdkfizXB19";
    }
    
    
    function mint(address to, uint tokenId ,uint[2] memory a, uint[2][2] memory b, uint[2] memory c,uint[4] memory input) external {
        require(tokenId >= 0 && tokenId < MAX, "tokenId out of range");
        verifier.verifyProof(a, b, c, input);
        _mint(to, tokenId);
    }
}