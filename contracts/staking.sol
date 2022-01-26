pragma solidity ^0.8.0;

import "./token.sol";
import "./nft.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract Stake is IERC721Receiver {

    struct tokenInfo {
        address owner;
        uint256 startTime;
        bool released;
    }

    mapping (uint256 => tokenInfo) stakeInfo;

    uint256 private constant rewardPerSecond = 1;

    address private _tokenAddress;
    address private _nftAddress; 

    mapping (address => uint256) staked;

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

    function stake(uint256 tokenId) external {
        _stake(msg.sender, tokenId);
    }

    function unstake(uint256 tokenId) external {
        _unstake(msg.sender, tokenId);
    }

    function _stake(address sender, uint256 tokenId) internal {
        require(stakeInfo[tokenId].owner == address(0), "token already staked");
        stakeInfo[tokenId].owner = sender;
        stakeInfo[tokenId].startTime = block.timestamp;
        NFT(_nftAddress).safeTransferFrom(sender, address(this), tokenId);
    }
    

    function _unstake(address sender, uint256 tokenId) internal {
        require(stakeInfo[tokenId].owner == sender, "sender is not token owner or not staked");
        stakeInfo[tokenId].owner = address(0);
        uint256 reward = (block.timestamp - stakeInfo[tokenId].startTime) * rewardPerSecond;
        NFT(_nftAddress).safeTransferFrom(address(this), sender, tokenId);
        Token(_tokenAddress).mintStakeReward(sender, reward);
    }


    function onERC721Received(address operator, address from, uint256 tokenId, bytes memory data) public override returns (bytes4) {
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));        
    }
}