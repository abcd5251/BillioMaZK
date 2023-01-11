require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.4",
  networks: { // specify network  add a network ( mumbai can be changed ) 
    goerli: {
      url: process.env.GOERLI_RPC, // .env env means the file name 
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};

/*
networks: {
  goerli: {
    url: process.env.GOERLI_RPC,
    accounts: [process.env.PRIVATE_KEY]
  }
},
*/