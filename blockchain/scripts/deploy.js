const { ignition } = require("hardhat");
const CharityManagerModule = require("../ignition/modules/CharityManager");

async function main() {
  const { charityManager } = await ignition.deploy(CharityManagerModule);
  console.log("CharityManager deployed to:", await charityManager.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});