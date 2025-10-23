const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace Contract Tests", function () {
    let TicketNFT, ticketNFT, Marketplace, marketplace;
    let owner, seller, buyer, anotherUser;
    const TICKET_ID = 1;
    const INITIAL_PRICE = ethers.parseEther("1.0"); // 1 ETH

    // This runs before each test, setting up a clean state
    beforeEach(async function () {
        // Get different accounts from Hardhat's local network
        [owner, seller, buyer, anotherUser] = await ethers.getSigners();

        // Deploy the TicketNFT contract
        const TicketNFTFactory = await ethers.getContractFactory("TicketNFT");
        ticketNFT = await TicketNFTFactory.deploy(owner.address, "http://localhost:3001/metadata/");
        await ticketNFT.waitForDeployment();
        const ticketNFTAddress = await ticketNFT.getAddress();

        // Deploy the Marketplace contract, linking it to the TicketNFT contract
        const MarketplaceFactory = await ethers.getContractFactory("Marketplace");
        marketplace = await MarketplaceFactory.deploy(ticketNFTAddress);
        await marketplace.waitForDeployment();
        const marketplaceAddress = await marketplace.getAddress();

        // IMPORTANT: Authorize the Marketplace to handle transfers in the NFT contract
        await ticketNFT.connect(owner).setMarketplace(marketplaceAddress);

        // Mint a new ticket from the owner to the 'seller' account for testing
        await ticketNFT.connect(owner).mintTicket(seller.address, TICKET_ID, INITIAL_PRICE);
    });

    describe("Deployment", function () {
        it("Should deploy contracts and set the marketplace address correctly", async function () {
            expect(await ticketNFT.marketplace()).to.equal(await marketplace.getAddress());
            expect(await marketplace.ticketNFT()).to.equal(await ticketNFT.getAddress());
        });

        it("Should mint a ticket to the seller", async function () {
            expect(await ticketNFT.ownerOf(TICKET_ID)).to.equal(seller.address);
        });
    });

    describe("Listing Tickets", function () {
        it("Should allow the owner of a ticket to list it for sale", async function () {
            const price = ethers.parseEther("1.5");
            
            // The seller lists the ticket. Check for the "TicketListed" event.
            await expect(marketplace.connect(seller).listTicket(TICKET_ID, price))
                .to.emit(marketplace, "TicketListed")
                .withArgs(TICKET_ID, seller.address, price);

            // Verify the listing details are stored correctly in the contract
            const listing = await marketplace.listings(TICKET_ID);
            expect(listing.seller).to.equal(seller.address);
            expect(listing.price).to.equal(price);
        });

        it("Should NOT allow a non-owner to list a ticket", async function () {
            const price = ethers.parseEther("1.5");
            // 'anotherUser' tries to list the ticket, which should fail
            await expect(marketplace.connect(anotherUser).listTicket(TICKET_ID, price))
                .to.be.revertedWith("Not your ticket");
        });

        it("Should NOT allow listing a ticket with a price of 0", async function () {
            await expect(marketplace.connect(seller).listTicket(TICKET_ID, 0))
                .to.be.revertedWith("Price must be > 0");
        });
    });

    describe("Buying Tickets", function () {
        const listingPrice = ethers.parseEther("1.2");

        beforeEach(async function () {
            // List a ticket before each buying test
            await marketplace.connect(seller).listTicket(TICKET_ID, listingPrice);
        });

        it("Should allow a user to buy a listed ticket with the correct amount", async function () {
            // The buyer purchases the ticket. We check that the seller's ETH balance increases.
            await expect(
                await marketplace.connect(buyer).buyTicket(TICKET_ID, { value: listingPrice })
            ).to.changeEtherBalance(seller, listingPrice);

            // Verify the new owner of the NFT is the buyer
            expect(await ticketNFT.ownerOf(TICKET_ID)).to.equal(buyer.address);

            // Verify the listing has been removed
            const listing = await marketplace.listings(TICKET_ID);
            expect(listing.price).to.equal(0);
        });

        it("Should update ticket details (price and resale count) after a sale", async function () {
            await marketplace.connect(buyer).buyTicket(TICKET_ID, { value: listingPrice });

            const details = await ticketNFT.ticketDetails(TICKER_ID);
            expect(details.lastSalePrice).to.equal(listingPrice);
            expect(details.resaleCount).to.equal(1);
        });

        it("Should NOT allow buying a ticket with incorrect ETH amount", async function () {
            const wrongPrice = ethers.parseEther("1.1");
            await expect(marketplace.connect(buyer).buyTicket(TICKET_ID, { value: wrongPrice }))
                .to.be.revertedWith("Incorrect ETH amount");
        });

        it("Should NOT allow buying a ticket that is not listed", async function () {
            const UNLISTED_TICKET_ID = 99;
            await expect(marketplace.connect(buyer).buyTicket(UNLISTED_TICKET_ID, { value: listingPrice }))
                .to.be.revertedWith("Not listed");
        });
    });

    describe("Anti-Scalping Resale Rules", function () {
        const firstSalePrice = ethers.parseEther("2.0");

        beforeEach(async function () {
            // Seller lists, Buyer buys
            await marketplace.connect(seller).listTicket(TICKET_ID, firstSalePrice);
            await marketplace.connect(buyer).buyTicket(TICKET_ID, { value: firstSalePrice });
        });

        it("Should allow resale within the price cap (120%)", async function () {
            // Price cap is 2.0 * 120 / 100 = 2.4 ETH
            const validResalePrice = ethers.parseEther("2.4");
            
            // The new owner (buyer) lists the ticket again
            await expect(marketplace.connect(buyer).listTicket(TICKET_ID, validResalePrice))
                .to.emit(marketplace, "TicketListed");
        });

        it("Should REJECT resale above the price cap (>120%)", async function () {
            const invalidResalePrice = ethers.parseEther("2.41");
            await expect(marketplace.connect(buyer).listTicket(TICKET_ID, invalidResalePrice))
                .to.be.revertedWith("Price exceeds resale cap");
        });

        it("Should REJECT listing after max resale count is reached", async function () {
            // Simulate 3 resales (MAX_RESALE_COUNT)
            // Sale 1 already happened in beforeEach
            
            // Sale 2: Buyer -> anotherUser
            await marketplace.connect(buyer).listTicket(TICKET_ID, firstSalePrice);
            await marketplace.connect(anotherUser).buyTicket(TICKET_ID, { value: firstSalePrice });
            
            // Sale 3: anotherUser -> seller
            await marketplace.connect(anotherUser).listTicket(TICKET_ID, firstSalePrice);
            await marketplace.connect(seller).buyTicket(TICKET_ID, { value: firstSalePrice });
            
            // At this point, resaleCount is 3. The new owner (seller) tries to list again.
            await expect(marketplace.connect(seller).listTicket(TICKET_ID, firstSalePrice))
                .to.be.revertedWith("Resale count exceeded");
        });
    });

    describe("Unlisting Tickets", function () {
        const listingPrice = ethers.parseEther("1.2");

        beforeEach(async function () {
            await marketplace.connect(seller).listTicket(TICKET_ID, listingPrice);
        });

        it("Should allow the lister to unlist their ticket", async function () {
            await expect(marketplace.connect(seller).unlistTicket(TICKET_ID))
                .to.emit(marketplace, "TicketUnlisted")
                .withArgs(TICKET_ID);

            const listing = await marketplace.listings(TICKET_ID);
            expect(listing.price).to.equal(0);
        });

        it("Should NOT allow a non-lister to unlist a ticket", async function () {
            await expect(marketplace.connect(anotherUser).unlistTicket(TICKET_ID))
                .to.be.revertedWith("Not the lister");
        });
    });
});
