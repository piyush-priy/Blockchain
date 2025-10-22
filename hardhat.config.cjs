// hardhat.config.cjs

require("@nomicfoundation/hardhat-toolbox");

// --- 1. PASTE YOUR 10 PERMANENT KEYS HERE ---
// (Make sure to keep the '0x' prefix for each key)

const MY_PERMANENT_KEYS = [
  "0x5ea6c8f20d1bdb163d09f49943835471242c707b462091a5ff9752e831f05013",
  "0x7f80caee29081dd5c26714949e88cd511b0a2f1e0bf16a556e343310f0182d9b",
  "0x49c6a1c5e4aec44951c1c66db56a35c642e8662ceef9360f1d4f22056a3dc62b",
  "0x08b4c39065da8aa12c9984eb333a67debe3a77567e53180ccbbd57bd0b0705dc",
  "0xfa8f2ee879690ec9e39508c7d8280185c2e110f0057006769ea2a5f529cf2856",
  "0x36891ae69caae3b3fcb5c06ba3cfafd7a202dc219c9a7eadf1af2e63a8bf2a13",
  "0xa2ba063bad7bd433af4a7b9197de4cf2ea451e1feb20738735697fec43bab439",
  "0xe448ef52f5773dd85438893ce0255a7ea3dfa4722da17fd8dc5582b44018182c",
  "0x68319eceae38e65e57b999ba31058229ad73c59f9a8379edee4943b3f902af92",
  "0x491a84acc9dfd8ad87a64c8b89bf3fbdac600c710c5b6a7c09ba426942babd12",
];

// --- 2. This function formats the keys for Hardhat ---
const hardhatAccounts = MY_PERMANENT_KEYS.map(key => {
  return {
    privateKey: key,
    balance: "10000000000000000000000", // 10,000 ETH
  };
});

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      // --- 3. This correctly uses your 10 permanent accounts ---
      accounts: hardhatAccounts,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      // We can also set the accounts for the --network localhost
      accounts: MY_PERMANENT_KEYS,
    },
  },
};