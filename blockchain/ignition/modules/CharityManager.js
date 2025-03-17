const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CharityManagerModule", (m) => {
  const charityManager = m.contract("CharityManager");
  return { charityManager };
});