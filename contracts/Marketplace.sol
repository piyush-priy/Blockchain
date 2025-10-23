// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

// This is a simplified interface. We only need ownerOf for verification.
interface ITicketNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function updateTicketSale(uint256 tokenId, uint256 price) external;
}

contract Marketplace is Ownable {
    // Fee taken by the platform on each secondary sale
    uint256 public platformFeeBasisPoints; // e.g., 250 = 2.5%

    struct Listing {
        address seller;
        address nftContract; // The specific contract for this event's tickets
        uint256 price;
        uint256 tokenId;
    }

    // Mapping from a unique listing ID to the Listing details
    mapping(uint256 => Listing) public listings;

    // We need a counter to ensure unique listing IDs
    uint256 private _nextListingId;

    event TicketListed(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed nftContract,
        address seller,
        uint256 price
    );
    event TicketSold(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed nftContract,
        address buyer,
        uint256 price
    );
    event TicketUnlisted(uint256 indexed listingId);
    event PlatformFeeUpdated(uint256 newFee);

    // The constructor now correctly takes the admin's address as the owner
    constructor(address initialOwner) Ownable(initialOwner) {
        platformFeeBasisPoints = 250; // Default 2.5% platform fee
    }

    function listTicket(address nftContract, uint256 tokenId, uint256 price) external {
        require(price > 0, "Marketplace: Price must be greater than zero");
        
        // Transfer the NFT from the seller to this marketplace contract (escrow)
        ITicketNFT(nftContract).transferFrom(msg.sender, address(this), tokenId);

        uint256 listingId = _nextListingId++;
        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            price: price,
            tokenId: tokenId
        });

        emit TicketListed(listingId, tokenId, nftContract, msg.sender, price);
    }

    function buyTicket(uint256 listingId) external payable {
        Listing storage listing = listings[listingId];
        require(listing.price > 0, "Marketplace: Ticket not listed for sale");
        require(msg.value >= listing.price, "Marketplace: Insufficient ETH sent");

        uint256 tokenId = listing.tokenId;
        address seller = listing.seller;
        address nftContract = listing.nftContract;
        uint256 price = listing.price;

        // Clear the listing from storage to prevent re-entrancy attacks
        delete listings[listingId];

        // Calculate and transfer the platform fee
        uint256 fee = (price * platformFeeBasisPoints) / 10000;
        uint256 sellerProceeds = price - fee;
        
        // Transfer funds
        (bool feeSuccess, ) = owner().call{value: fee}("");
        require(feeSuccess, "Marketplace: Fee transfer failed");
        
        (bool sellerSuccess, ) = seller.call{value: sellerProceeds}("");
        require(sellerSuccess, "Marketplace: Seller payment failed");

        // Transfer the NFT from the marketplace to the buyer
        ITicketNFT(nftContract).transferFrom(address(this), msg.sender, tokenId);

        ITicketNFT(nftContract).updateTicketSale(tokenId, price);
        
        emit TicketSold(listingId, tokenId, nftContract, msg.sender, price);
    }

    function unlistTicket(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Marketplace: You are not the seller");

        // Get the tokenId from the struct
        uint256 tokenId = listing.tokenId; 
        address nftContract = listing.nftContract;
        
        // Clear the listing
        delete listings[listingId];
        
        // Return the NFT from escrow back to the seller
        ITicketNFT(nftContract).transferFrom(address(this), msg.sender, tokenId);

        emit TicketUnlisted(listingId);
    }

    function setPlatformFee(uint256 _newFeeBasisPoints) public onlyOwner {
        require(_newFeeBasisPoints <= 1000, "Marketplace: Fee cannot exceed 10%");
        platformFeeBasisPoints = _newFeeBasisPoints;
        emit PlatformFeeUpdated(_newFeeBasisPoints);
    }
}