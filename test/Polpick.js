const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("PolPick Contract", function () {
  async function deployPolPickFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const PolPick = await ethers.getContractFactory("PolPick");
    const polPick = await PolPick.deploy(owner.address);

    await polPick.waitForDeployment();
    console.log("Contract address:", polPick)

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

  describe("Game Functions", function () {
    it("Should start the game", async function () {
      const { polPick } = await loadFixture(deployPolPickFixture);
      await polPick.startGame();
      expect(await polPick.isRunning()).to.equal(true);
    });

    it("Should create a pool", async function () {
      const { polPick } = await loadFixture(deployPolPickFixture);
      const poolId = ethers.utils.formatBytes32String("pool1");
      console.log("PoolId is:", poolId)
      await polPick.createPool(poolId, 100, 1000, 10);
      const pool = await polPick.pools(poolId);
      expect(pool.created).to.equal(true);
      expect(pool.minBetAmount).to.equal(100);
      expect(pool.maxBetAmount).to.equal(1000);
      expect(pool.poolBetsLimit).to.equal(10);
    });

    it("Should return true for an open pool", async function () {
      const { polPick } = await loadFixture(deployPolPickFixture);
      const poolId = ethers.utils.formatBytes32String("pool2");
      await polPick.createPool(poolId, 100, 1000, 10);
      expect(await polPick.isPoolOpen(poolId)).to.equal(true);
    });

    it("Should revert if a non-gameController tries to create a pool", async function () {
      const { polPick, addr1 } = await loadFixture(deployPolPickFixture);
      const poolId = ethers.utils.formatBytes32String("pool3");
      await expect(
        polPick.connect(addr1).createPool(poolId, 100, 1000, 10)
      ).to.be.revertedWith("Only game controller can do this");
    });
  });
});
