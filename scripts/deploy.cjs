const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy TicketNFTFactory
  // This contract creates unique NFT contracts for each new event.
  // Its constructor takes no arguments.
  const TicketNFTFactory = await ethers.getContractFactory("TicketNFTFactory");
  const ticketNFTFactory = await TicketNFTFactory.deploy();
  await ticketNFTFactory.waitForDeployment();
  const ticketNFTFactoryAddress = await ticketNFTFactory.getAddress();
  console.log("TicketNFTFactory deployed to:", ticketNFTFactoryAddress);

  // 2. Deploy Marketplace
  // This is the single, central marketplace for all secondary sales.
  // Its constructor requires the platform admin's address to set the owner correctly.
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(deployer.address); // Pass the admin/deployer address
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("Marketplace deployed to:", marketplaceAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

