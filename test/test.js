const { expect } = require("chai");
const { ethers } = require("hardhat");

async function addTime(additionalTime) {
  await network.provider.send("evm_increaseTime", [Number(additionalTime)])
  await ethers.provider.send('evm_mine');
}


describe("NFT staking", function () {

  let Token, token, NFT, nft, Sale, sale, Stake, stake, owner, receiver;
  const tokenId = 12345;

  beforeEach(async () => {
    [owner, receiver] = await ethers.getSigners();
    Token = await ethers.getContractFactory("Token");
    token = await Token.deploy();
    await token.deployed();
    NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy();
    await nft.deployed();
    Sale = await ethers.getContractFactory("Sale");
    sale = await Sale.deploy(token.address, nft.address);
    await sale.deployed();

    Stake = await ethers.getContractFactory("Stake");
    stake = await Stake.deploy(token.address, nft.address);

    await stake.deployed();

    await nft.grantMinterRole(sale.address);
    await token.grantMinterRole(stake.address);
  })
  describe("sale", function() {
    it ("deploy token and nft", async function() {
      expect(await token.name()).to.equal("token");
      expect(await nft.name()).to.equal("non fungible token");
    });
    it ("deploy sale and staking", async function() {
      expect(await sale.tokenAddress()).to.equal(token.address);
      expect(await sale.nftAddress()).to.equal(nft.address);
      expect(await stake.tokenAddress()).to.equal(token.address);
      expect(await stake.nftAddress()).to.equal(nft.address);
    });
    it("sale test", async function () {
      // buy nft
      expect(await token.balanceOf(owner.address)).to.equal(1000);
      expect(await nft.balanceOf(owner.address)).to.equal(0);
      await token.increaseAllowance(sale.address, 10);
      await sale.buy(receiver.address, tokenId);
      expect(await token.balanceOf(owner.address)).to.equal(990);
      expect(await token.balanceOf(receiver.address)).to.equal(10);
      expect(await nft.balanceOf(owner.address)).to.equal(1);
    });
  });

  describe("minting", function() {
    it("minting only from certain contract address", async function() {
    await expect(token.mintStakeReward(owner.address, 9999)).to.be.reverted;
    await expect(nft.mint(owner.address, 9999)).to.be.reverted;
    });
  });

  describe("staking", function() {

    beforeEach(async () => {
      await token.increaseAllowance(sale.address, 10);
      await sale.buy(receiver.address, tokenId);
    });

    it("correct staking", async function() {
      let oldBalance = await token.balanceOf(owner.address);
      let delta = 20;
      await nft.approve(stake.address, tokenId);
      await stake.stake(tokenId);
      addTime(delta);
      await stake.unstake(tokenId);
      expect(await token.balanceOf(owner.address)).to.equal(BigInt(oldBalance) + BigInt(delta));
    });

    it("double staking of nft with a same id", async function() {
      await nft.approve(stake.address, tokenId);
      await stake.stake(tokenId);
      await expect(stake.stake(tokenId)).to.be.revertedWith("token already staked");
    });

    it("double unstaking nft with same id", async function() {
      await nft.approve(stake.address, tokenId);
      await stake.stake(tokenId);
      await stake.unstake(tokenId);
      await expect(stake.unstake(tokenId)).to.be.revertedWith("sender is not token owner or not staked");
    });

    it ("unstaking nft by a non-owner", async function() {
      await nft.approve(stake.address, tokenId);
      await stake.stake(tokenId);
      await expect(stake.connect(receiver).unstake(tokenId)).to.be.revertedWith("sender is not token owner or not staked");
    });
  
  });
});
