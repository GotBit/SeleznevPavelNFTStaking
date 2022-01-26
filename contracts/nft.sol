pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract NFT is ERC721, Ownable {
    
    address private saleAddress;

    constructor() ERC721("non fungible token", "NFT") Ownable() { 
    }

    function setSaleAddress(address saleAddress_) public onlyOwner {
        saleAddress = saleAddress_;
    }

    function mint(address to_, uint256 tokenId) public {
        require(msg.sender == saleAddress, "sender address is not sale contract address");
        _safeMint(to_, tokenId);
    }
}