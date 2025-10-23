const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TicketSystemModule", (m) => {
  // Get the deployer account
  const initialOwner = m.getAccount(0);

  // Deploy the TicketNFT contract
  const ticketNFT = m.contract("TicketNFT", [initialOwner]);

  // Deploy the Marketplace contract, passing the TicketNFT address to its constructor
  const marketplace = m.contract("Marketplace", [ticketNFT]);

  // After deployment, call the setMarketplaceAddress function on the TicketNFT contract
  // This authorizes the Marketplace to interact with the TicketNFT contract
  m.call(ticketNFT, "setMarketplaceAddress", [marketplace]);

  console.log("TicketNFT deployed to:", ticketNFT);
  console.log("Marketplace deployed to:", marketplace);

  return { ticketNFT, marketplace };
});