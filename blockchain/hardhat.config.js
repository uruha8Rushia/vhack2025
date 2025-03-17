require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    // Local network (Ganache)
    localhost: {
      url: "http://127.0.0.1:8545", // Ganache default port
      chainId: 31337,
    },
  },
};