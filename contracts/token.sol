pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract Token is ERC20, Ownable {

    address private stakeAddress;

    constructor() ERC20("token", "T") Ownable() {
        _mint(msg.sender, 1000);
    }

    function setStakeAddress(address stakeAddress_) public onlyOwner {
        stakeAddress = stakeAddress_;
    }

    function mintStakeReward(address to, uint256 amount) public {
        require(msg.sender == stakeAddress, "sender address is not stake contract address");
        _mint(to, amount);
    }
}