// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
// NEW: Import ERC721URIStorage to get the _setTokenURI function and on-chain URI storage
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/**
 * @title TicketNFT
 * @dev An ERC721 contract for creating and managing event tickets as NFTs.
 * Each contract instance is owned by an event organizer who can mint tickets
 * and withdraw sales revenue. It supports on-chain royalty standards via ERC2981.
 */
// MODIFIED: Inherit from ERC721URIStorage as well
contract TicketNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, ERC2981 {
    uint256 private _nextTokenId;

    // Address of the marketplace contract allowed to call certain functions
    address public marketplaceAddress;

    // Royalty fee in basis points (e.g., 500 = 5%)
    uint96 public royaltyFeeBasisPoints;

    // Struct to hold extra on-chain data for each ticket
    struct Ticket {
        uint256 lastSalePrice;
        uint256 resaleCount;
    }

    mapping(uint256 => Ticket) public ticketData;

    constructor(address initialOwner)
        ERC721("TicketNFT", "TKT")
        Ownable(initialOwner)
    {
        // Set a default royalty fee of 5% upon deployment
        royaltyFeeBasisPoints = 500;
    }

    /**
     * @dev Sets the approved marketplace address. Only the contract owner can call this.
     * The marketplace needs this approval to update ticket sale data.
     */
    function setMarketplaceAddress(address _marketplaceAddress) public onlyOwner {
        marketplaceAddress = _marketplaceAddress;
    }

    /**
     * @dev Allows the owner to update the royalty fee percentage for the contract.
     */
    function setRoyaltyFee(uint96 _feeBasisPoints) public onlyOwner {
        royaltyFeeBasisPoints = _feeBasisPoints;
    }

    /**
     * @dev Mints a new ticket NFT. Only the contract owner (the event organizer) can do this.
     * @param to The address to receive the new ticket.
     * @param uri The metadata URI for the ticket.
     * @param initialPrice The price of the primary sale.
     */
    function mint(address to, string memory uri, uint256 initialPrice) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        // FIX: This function is now available by inheriting from ERC721URIStorage
        _setTokenURI(tokenId, uri);
        ticketData[tokenId] = Ticket({
            lastSalePrice: initialPrice,
            resaleCount: 0
        });
    }
    
    /**
     * @dev Allows the contract owner (organizer) to withdraw the entire ETH balance of the contract.
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw.");
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed.");
    }

    /**
     * @dev Allows the marketplace to update a ticket's sale price and resale count after a successful sale.
     * This ensures on-chain resale data is accurate.
     */
    function updateTicketSale(uint256 tokenId, uint256 price) public {
        require(msg.sender == marketplaceAddress, "TicketNFT: Caller is not the approved marketplace");
        // Use a storage pointer for gas efficiency
        Ticket storage ticket = ticketData[tokenId];
        ticket.lastSalePrice = price;
        ticket.resaleCount++;
    }

    /**
     * @dev Returns the on-chain details for a specific ticket.
     */
    function ticketDetails(uint256 tokenId) public view returns (uint256 lastSalePrice, uint256 resaleCount) {
        Ticket memory ticket = ticketData[tokenId];
        return (ticket.lastSalePrice, ticket.resaleCount);
    }
    
    /**
     * @dev Returns the next token ID that will be minted.
     */
    function nextTokenId() public view returns (uint256) {
        return _nextTokenId;
    }
    
    /**
     * @dev See {IERC2981-royaltyInfo}.
     * Returns the royalty information for a given token sale. The royalty is paid to the contract owner.
     */
    function royaltyInfo(uint256, uint256 _salePrice) public view override(ERC2981) returns (address receiver, uint256 royaltyAmount) {
        return (owner(), (_salePrice * royaltyFeeBasisPoints) / 10000);
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     * This is required because both ERC721 and ERC721URIStorage have a tokenURI function.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    // --- Overrides required by OpenZeppelin for multiple inheritance ---

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        address from = _ownerOf(tokenId);

        // Allow minting (when 'from' is address(0))
        if (from == address(0)) {
            return super._update(to, tokenId, auth);
        }

        // Allow transfers TO or FROM the approved marketplace
        if (to == marketplaceAddress || from == marketplaceAddress) {
            return super._update(to, tokenId, auth);
        }

        // Block all other transfers
        revert("TicketNFT: Transfers are only allowed via the marketplace");
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        // MODIFIED: Added ERC721URIStorage to the override list
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

