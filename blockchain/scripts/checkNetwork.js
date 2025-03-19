const { ethers } = require("hardhat");

async function checkNetwork() {
  const network = await ethers.provider.getNetwork();
  console.log("Network ID:", network.chainId);
}
checkNetwork();