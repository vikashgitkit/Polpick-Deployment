const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");
const { hexlify, parseUnits } = ethers;
const { toUtf8Bytes } = require("@ethersproject/strings");

describe("PolPick Contract", function () {
  async function deployPolPickFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const PolPick = await ethers.getContractFactory("PolPick");
    const polPick = await PolPick.deploy(owner.address);
    
    await polPick.waitForDeployment();

    console.log("PolPick contract deployed at address:", polPick.target); // This will log the contract address
    return { polPick, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { polPick, owner } = await loadFixture(deployPolPickFixture);
      expect(await polPick.owner()).to.equal(owner.address);
    });

    it("Should set the correct gameController address", async function () {
      const { polPick, owner } = await loadFixture(deployPolPickFixture);
      expect(await polPick.gameController()).to.equal(owner.address);
    });

    it("Should initialize the game as not running", async function () {
      const { polPick } = await loadFixture(deployPolPickFixture);
      expect(await polPick.isRunning()).to.equal(false);
    });
  });

  describe("Polpick Game Functions", function () {
    it("Should start the game", async function () {
      const { polPick, owner } = await loadFixture(deployPolPickFixture);
      await polPick.connect(owner).startGame();
      expect(await polPick.isRunning()).to.equal(true);
    });

    it("Should create a pool with minimum and maximum bet amounts in ETH", async function () {
      const { polPick, owner } = await loadFixture(deployPolPickFixture);
      const poolId = hexlify(toUtf8Bytes("pool1"));
      console.log("🚀 ~ poolId:", poolId)
      const minBetAmount = parseUnits("0.1"); // 0.1 ETH
      const maxBetAmount = parseUnits("1.0"); // 1 ETH
      const poolBetsLimit = 10;
      
      await polPick.connect(owner).createPool(poolId, minBetAmount, maxBetAmount, poolBetsLimit);
      const pool = await polPick.pools(poolId);
      
      expect(pool.created).to.equal(true);
      expect(pool.minBetAmount).to.equal(minBetAmount);
      expect(pool.maxBetAmount).to.equal(maxBetAmount);
      expect(pool.poolBetsLimit).to.equal(poolBetsLimit);
    });

    it("Should return true for an open pool", async function () {
      const { polPick, owner } = await loadFixture(deployPolPickFixture);
      const poolId = hexlify(toUtf8Bytes("pool2"));
      console.log("🚀 ~ poolId:", poolId)
      const minBetAmount = parseUnits("0.1"); // 0.1 ETH
      const maxBetAmount = parseUnits("1.0"); // 1 ETH
      const poolBetsLimit = 10;
      
      await polPick.connect(owner).createPool(poolId, minBetAmount, maxBetAmount, poolBetsLimit);
      expect(await polPick.isPoolOpen(poolId)).to.equal(true);
    });

    it("Should revert if a non-gameController address tries to create a pool", async function () {
      const { polPick, addr1 } = await loadFixture(deployPolPickFixture);
      const poolId = hexlify(toUtf8Bytes("pool1"));
      await expect(polPick.connect(addr1).createPool(poolId, 100, 1000, 10)).to.be.revertedWith("Only game controller can do this");
    });


    describe("makeTrade Function", function () {
      it("Should make a trade successfully", async function () {
        const { polPick, owner, addr1 } = await loadFixture(deployPolPickFixture);
        const poolId = hexlify(toUtf8Bytes("pool9"));
        await polPick.connect(owner).createPool(poolId, 100, 1000, 10);
        await polPick.connect(owner).startGame();

        await polPick.connect(addr1).makeTrade({
          poolId: poolId,
          avatarUrl: "https://example.com/avatar1.png",
          countryCode: "US",
          upOrDown: true,
          whiteLabelId: "WL123",
          gameId: "GAME123"
        }, { value: parseEther("0.2") });

        const pool = await polPick.pools(poolId);
        expect(pool.upBetGroup.total).to.equal(parseEther("0.2"));
      });
    });


    it("Should trigger a round start", async function () {
      const { polPick, owner } = await loadFixture(deployPolPickFixture);
      const poolId = hexlify(toUtf8Bytes("pool6"));
      const timeMS = 1721744443;
      const price = 62667;
      const batchSize = 10;

      await polPick.connect(owner).createPool(poolId, 100, 1000, 10);
      await polPick.connect(owner).startGame();

      await polPick.connect(owner).trigger(poolId, timeMS, price, batchSize);

      const pool = await polPick.pools(poolId);
      expect(pool.startPrice).to.equal(price);
      expect(pool.roundStartTime).to.equal(timeMS);
    });
  });
});
