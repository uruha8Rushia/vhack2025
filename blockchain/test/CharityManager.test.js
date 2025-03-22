const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CharityManager", function () {
  let CharityManager, charityManager, owner, donor;

  beforeEach(async () => {
    [owner, donor] = await ethers.getSigners();
    CharityManager = await ethers.getContractFactory("CharityManager");
    charityManager = await CharityManager.deploy();
  });

  // Test 1: Contract deploys successfully
  it("Should deploy the contract", async () => {
    expect(charityManager.target).to.exist;
  });

  // Test 2: Create a charity with a deadline
  it("Should create a charity with a deadline", async () => {
    await charityManager.createCharity("Test Charity", ethers.parseEther("5"), 7); // 7 days
    const charity = await charityManager.charities(0);
    expect(charity.name).to.equal("Test Charity");
    expect(charity.goal.toString()).to.equal(ethers.parseEther("5").toString());
    expect(charity.deadline).to.be.gt(0);
  });

  // Test 3: Donate to a charity before the deadline
  it("Should accept donations before the deadline", async () => {
    await charityManager.createCharity("Test Charity", ethers.parseEther("5"), 7);
    await charityManager.connect(donor).donate(0, { value: ethers.parseEther("1") });
    const charity = await charityManager.charities(0);
    expect(charity.fundsRaised.toString()).to.equal(ethers.parseEther("1").toString());
  });

  // Test 4: Reject donations after the deadline
  it("Should NOT accept donations after the deadline", async () => {
    await charityManager.createCharity("Test Charity", ethers.parseEther("5"), 1); // 1 day
    await ethers.provider.send("evm_increaseTime", [86400 * 2]); // Fast-forward 2 days
    await ethers.provider.send("evm_mine"); // Mine a new block
    await expect(
      charityManager.connect(donor).donate(0, { value: ethers.parseEther("1") })
    ).to.be.revertedWith("Donation period ended");
  });

  // Test 5: Release funds when goal is met after deadline
  it("Should release funds when goal is met after deadline", async () => {
    await charityManager.createCharity("Test Charity", ethers.parseEther("5"), 7);
    await charityManager.connect(donor).donate(0, { value: ethers.parseEther("5") });
    await ethers.provider.send("evm_increaseTime", [86400 * 8]); // Fast-forward 8 days
    await ethers.provider.send("evm_mine"); // Mine a new block
    await charityManager.releaseFunds(0);
    const charity = await charityManager.charities(0);
    expect(charity.fundsReleased).to.equal(true);
  });

  // Test 6: Prevent releasing funds before deadline
  it("Should NOT release funds before deadline", async () => {
    await charityManager.createCharity("Test Charity", ethers.parseEther("5"), 7);
    await charityManager.connect(donor).donate(0, { value: ethers.parseEther("5") });
    await expect(charityManager.releaseFunds(0)).to.be.revertedWith("Deadline not reached");
  });

  // Test 7: Allow refunds if goal is not met after deadline
  it("Should allow refunds if goal is not met after deadline", async () => {
    await charityManager.createCharity("Test Charity", ethers.parseEther("5"), 1);
    await charityManager.connect(donor).donate(0, { value: ethers.parseEther("3") });
    await ethers.provider.send("evm_increaseTime", [86400 * 2]); // Fast-forward 2 days
    await ethers.provider.send("evm_mine"); // Mine a new block

    const initialBalance = await ethers.provider.getBalance(donor.address);
    await charityManager.connect(donor).claimRefund(0);
    const finalBalance = await ethers.provider.getBalance(donor.address);

    expect(finalBalance).to.be.gt(initialBalance);
  });

  // Test 8: Prevent refunds if goal is met
  it("Should NOT allow refunds if goal is met", async () => {
    await charityManager.createCharity("Test Charity", ethers.parseEther("5"), 7);
    await charityManager.connect(donor).donate(0, { value: ethers.parseEther("5") });
    await ethers.provider.send("evm_increaseTime", [86400 * 8]); // Fast-forward 8 days
    await ethers.provider.send("evm_mine"); // Mine a new block

    await expect(
      charityManager.connect(donor).claimRefund(0)
    ).to.be.revertedWith("Goal was met");
  });

  // Test 9: Track donations for a charity
  it("Should track donations for a charity", async () => {
    await charityManager.createCharity("Test Charity", ethers.parseEther("5"), 7);
    await charityManager.connect(donor).donate(0, { value: ethers.parseEther("1") });

    const donations = await charityManager.getDonations(0);
    expect(donations.length).to.equal(1);
    expect(donations[0].donor).to.equal(donor.address);
    expect(donations[0].amount.toString()).to.equal(ethers.parseEther("1").toString());
  });

  // Test 10: Prevent refunds if no donations were made
  it("Should NOT allow refunds if no donations were made", async () => {
    await charityManager.createCharity("Test Charity", ethers.parseEther("5"), 1);
    await ethers.provider.send("evm_increaseTime", [86400 * 2]); // Fast-forward 2 days
    await ethers.provider.send("evm_mine"); // Mine a new block

    await expect(
      charityManager.connect(donor).claimRefund(0)
    ).to.be.revertedWith("No donations to refund");
  });
});