require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  
  // Add this 'networks' section right here
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      // As per the guide, paste your private key from the Hardhat node here
      accounts: [`0x${"ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"}`]
    }
  }
};

