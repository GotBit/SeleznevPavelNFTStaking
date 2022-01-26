const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Greeter", function () {
  it ("deploy sale and staking", async function() {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    await token.deployed();
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy();
    await nft.deployed();
    const Sale = await ethers.getContractFactory("Sale");
    const sale = await Sale.deploy(token.address, nft.address);
    await sale.deployed();

    const Stake = await ethers.getContractFactory("Stake");
    const stake = await Stake.deploy(token.address, nft.address);
    await stake.deployed();

    expect(await sale.tokenAddress()).to.equal(token.address);
    expect(await sale.nftAddress()).to.equal(nft.address);
    expect(await stake.tokenAddress()).to.equal(token.address);
    expect(await stake.nftAddress()).to.equal(nft.address);
  });
  it("sale and staking test", async function () {
    let [owner, receiver] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    await token.deployed();
    expect(await token.name()).to.equal("token");
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy();
    await nft.deployed();
    expect(await nft.name()).to.equal("non fungible token");
    expect(await token.balanceOf(owner.address)).to.equal(1000);

    const Sale = await ethers.getContractFactory("Sale");
    const sale = await Sale.deploy(token.address, nft.address);
    await sale.deployed();

    const tokenId = 12345;
    // buy nft
    await nft.setSaleAddress(sale.address);
    expect(await nft.balanceOf(owner.address)).to.equal(0);
    await token.increaseAllowance(sale.address, 10);
    await sale.buy(receiver.address, tokenId);
    expect(await token.balanceOf(owner.address)).to.equal(990);
    expect(await token.balanceOf(receiver.address)).to.equal(10);
    
    expect(await nft.balanceOf(owner.address)).to.equal(1);


    // staking
    const Stake = await ethers.getContractFactory("Stake");
    const stake = await Stake.deploy(token.address, nft.address);
    await stake.deployed();


    await token.setStakeAddress(stake.address);

    
    await nft.approve(stake.address, tokenId);
    await stake.stake(tokenId);
    await expect(stake.stake(tokenId)).to.be.revertedWith("token already staked");
    await stake.unstake(tokenId);
    expect(await token.balanceOf(owner.address)).to.equal(992);

    await expect(stake.unstake(tokenId)).to.be.revertedWith("token already unstaked");


    await nft.approve(stake.address, tokenId);
    await stake.stake(tokenId);
    await expect(stake.connect(receiver).unstake(tokenId)).to.be.revertedWith("sender is not token owner");


    // test failed require
    await expect(token.mintStakeReward(owner.address, 9999)).to.be.revertedWith("sender address is not stake contract address");
    await expect(nft.mint(owner.address, 9999)).to.be.revertedWith("sender address is not sale contract address");
    

  });
});
