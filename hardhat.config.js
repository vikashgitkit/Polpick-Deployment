require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()


module.exports = {
  solidity: "0.8.24",
  networks: {
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.POLYGON_PRIVATE_KEY],
    },
  },
};
