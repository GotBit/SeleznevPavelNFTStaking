pragma solidity ^0.8.0;


import "./token.sol";
import "./nft.sol";

contract Sale {
    uint256 private nftPrice = 10;
    address private _tokenAddress;
    address private _nftAddress;
    
    constructor (address tokenAddress_, address nftAddress_) {
        _tokenAddress = tokenAddress_;
        _nftAddress = nftAddress_;
    }

    function tokenAddress() public view returns (address) {
        return _tokenAddress;
    }

    function nftAddress() public view returns (address) {
        return _nftAddress;
    }

    function buy(address receiver, uint256 tokenId) public {
        Token(_tokenAddress).transferFrom(msg.sender, receiver, nftPrice);
        NFT(_nftAddress).mint(msg.sender, tokenId);
    }
}