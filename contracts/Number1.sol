// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./base/ERC721.sol";


interface IVerifier16{
    function verifyProof(uint[2] memory a, uint[2][2] memory b,uint[2] memory c,uint[4] memory input) external;
}

library ECDSA{

    function verify(bytes32 _msgHash, bytes memory _signature, address _signer) internal pure returns (bool) {
        return recoverSigner(_msgHash, _signature) == _signer;
    }

    
    function recoverSigner(bytes32 _msgHash, bytes memory _signature) internal pure returns (address){
        
        require(_signature.length == 65, "invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
           
            r := mload(add(_signature, 0x20))
           
            s := mload(add(_signature, 0x40))
           
            v := byte(0, mload(add(_signature, 0x60)))
        }
      
        return ecrecover(_msgHash, v, r, s);
    }
    
    function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}

contract Number1 is ERC721{
    uint public MAX = 10000; 
    uint public tokenId = 0;
    mapping(address => bool) public mintedAddress;

    IVerifier16 verifier;
   
    constructor(string memory name_, string memory symbol_, address _verifier) ERC721(name_, symbol_){
        verifier = IVerifier16(_verifier);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://ipfs.io/ipfs/QmbJQoserN4U7xkLbwMsTrcggAxzwjVrjWvgSN7QBPoh83";
    }

    function getMessageHash(address _account, uint256 _tokenId) public pure returns(bytes32){
        return keccak256(abi.encodePacked(_account, _tokenId));
    }

    function verify(bytes32 _msgHash, bytes memory _signature, address signer)
    public pure returns (bool)
    {
        return ECDSA.verify(_msgHash, _signature, signer);
    }

    function ethSignedMessageHash(address _to, uint256 _tokenid) internal pure returns(bytes32){
        bytes32 _msgHash = getMessageHash(_to, _tokenid); // wrap msg
        bytes32 _ethSignedMessageHash = ECDSA.toEthSignedMessageHash(_msgHash);
        return _ethSignedMessageHash;
    }

    function check_recover(bytes32 _msgHash, bytes memory _signature) external pure returns (address){
        return ECDSA.recoverSigner(_msgHash, _signature);
    }
    
    function mint(address _to, bytes memory _signature, uint[2] memory a, uint[2][2] memory b, uint[2] memory c,uint[4] memory input) external {
        require(tokenId >= 0 && tokenId < MAX, "tokenId out of range");
        bytes32 _ethmsgHash = ethSignedMessageHash(_to, tokenId); // wrap msg
        require(verify(_ethmsgHash, _signature, _to), "Invalid signature"); // ECDSA verify
        require(!mintedAddress[_to], "Already minted!"); 
        verifier.verifyProof(a, b, c, input); // verify Semaphore 
        _mint(_to, tokenId);
        tokenId++;
    }
}