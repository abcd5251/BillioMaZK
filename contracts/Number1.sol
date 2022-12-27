// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol"; // a combination between ERC-721 and ERC-20
// ERC 721 : deploy a unique nft  ERC 1155 : multiple nft  
import "@openzeppelin/contracts/utils/Strings.sol";



contract Number1 is ERC1155 {

    string public name;
    string public symbol; 
    uint256 public tokenCount; // Count of how much token have been claimed
    string public baseUri; // a link that point to our nft collection who is uploaded on ipfs 
    // will not store actual nfts here , just point to them using this baseUri

    constructor(string memory _name, string memory _symbol, string memory _baseUri) ERC1155(_baseUri) {
        name = _name;
        symbol = _symbol;
        baseUri = _baseUri;
    }

    // we need to override the uri function so our nfts are compatible with opensea
    function uri(uint256 _tokenId) override public view returns(string memory) {
        return string (
            abi.encodePacked(
                baseUri,  // where entire collection is stored , will be deployed later on IPFS
                Strings.toString(_tokenId),
                ".json" // because all nft are going to be just json files
                // an nft just json file here   
            ) 
        );
    } // takes in this token id of the nft 
    // returns uri or the link where this nft is uploaded on IPFS

    function mint() public {  

        tokenCount += 1;
        _mint(msg.sender, tokenCount, 1, "Claim Successful"); // "" means extra data , but no need here 
    }
}