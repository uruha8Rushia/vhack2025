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

  // Test 2: Create a charity
  it("Should create a charity", async () => {
    await charityManager.createCharity("Test Charity", ethers.parseEther("5"));
    const charity = await charityManager.charities(0);
    expect(charity.name).to.equal("Test Charity");
    expect(charity.goal.toString()).to.equal(ethers.parseEther("5").toString());
  });

  // Test 3: Donate to a charity
  it("Should accept donations", async () => {
    await charityManager.createCharity("Test Charity", ethers.parseEther("5"));
    await charityManager.connect(donor).donate(0, { value: ethers.parseEther("1") });
    const charity = await charityManager.charities(0);
    expect(charity.fundsRaised.toString()).to.equal(ethers.parseEther("1").toString());
  });

  // Test 4: Release funds when goal is met
  it("Should release funds when goal is met", async () => {
    await charityManager.createCharity("Test Charity", ethers.parseEther("5"));
    await charityManager.connect(donor).donate(0, { value: ethers.parseEther("5") });
    await charityManager.releaseFunds(0);
    const charity = await charityManager.charities(0);
    expect(charity.fundsReleased).to.equal(true);
  });

  // Test 5: Prevent releasing funds if goal not met
  it("Should NOT release funds if goal not met", async () => {
    await charityManager.createCharity("Test Charity", ethers.parseEther("5"));
    await charityManager.connect(donor).donate(0, { value: ethers.parseEther("3") });
    await expect(charityManager.releaseFunds(0)).to.be.revertedWith("Goal not met");
  });
});