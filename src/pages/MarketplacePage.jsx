import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { AppContext } from '../context/AppContext';
import PageTitle from '../components/PageTitle';
import Marketplace from '../../artifacts/contracts/Marketplace.sol/Marketplace.json';
import TicketNFT from '../../artifacts/contracts/TicketNFT.sol/TicketNFT.json';
import { MARKETPLACE_ADDRESS } from '../config';
import './marketplace.css';

const MarketplacePage = () => {
    const { provider, showMessage, currentUser: user } = useContext(AppContext);
    const [listedTickets, setListedTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListedTickets = async () => {
            if (!provider) return;
            setLoading(true);
            try {
                const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, Marketplace.abi, provider);

                // Fetch all past "TicketListed" events
                const listedFilter = marketplaceContract.filters.TicketListed();
                const listedEvents = await marketplaceContract.queryFilter(listedFilter);

                // Fetch all past "TicketSold" and "TicketUnlisted" events
                const soldFilter = marketplaceContract.filters.TicketSold();
                const soldEvents = await marketplaceContract.queryFilter(soldFilter);
                const unlistedFilter = marketplaceContract.filters.TicketUnlisted();
                const unlistedEvents = await marketplaceContract.queryFilter(unlistedFilter);

                // Create a set of unique identifiers for tickets that are no longer active
                // const soldOrUnlisted = new Set([
                //     ...soldEvents.map(e => `${e.args.nftContract}-${e.args.tokenId}`),
                //     ...unlistedEvents.map(e => `${e.args.nftContract}-${e.args.tokenId}`)
                // ]);

                // We now use listingId as the unique key for sold/unlisted tickets
                const soldOrUnlisted = new Set([
                    ...soldEvents.map(e => e.args.listingId.toString()),
                    ...unlistedEvents.map(e => e.args.listingId.toString())
                ]);

                // Filter out the events for tickets that have been sold or unlisted
                const activeListings = listedEvents.filter(e => !soldOrUnlisted.has(e.args.listingId.toString()));

                // Fetch metadata for each active listing
                const ticketsWithMetadata = await Promise.all(
                    activeListings.map(async (e) => {
                        const { listingId, nftContract, tokenId, seller, price } = e.args;
                        const ticketContract = new ethers.Contract(nftContract, TicketNFT.abi, provider);
                        const tokenUri = await ticketContract.tokenURI(tokenId);

                        // Assuming the token URI is a link to a backend metadata endpoint
                        const metadataResponse = await fetch(tokenUri);
                        const metadata = await metadataResponse.json();

                        return {
                            listingId,
                            nftContract,
                            tokenId,
                            seller,
                            price,
                            ...metadata
                        };
                    })
                );

                setListedTickets(ticketsWithMetadata);
                console.log("Fetched listed tickets:", ticketsWithMetadata);

            } catch (error) {
                console.error("Failed to fetch listed tickets:", error);
                showMessage("Could not load marketplace listings.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchListedTickets();
    }, [provider, showMessage]);


    const handleBuyTicket = async (ticket) => {
        if (!provider || !user || !user.wallet) {
            showMessage("Please connect your wallet.", "error");
            return;
        }
        const toastId = showMessage("Processing purchase...", "loading");

        try {
            const signer = await provider.getSigner();
            const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, Marketplace.abi, signer);

            // 1. Blockchain Transaction
            const tx = await marketplaceContract.buyTicket(ticket.listingId, { value: ticket.price });
            showMessage("Waiting for transaction confirmation...", { id: toastId, type: 'loading' });
            await tx.wait();

            showMessage("Updating ticket ownership in database...", { id: toastId, type: 'loading' });

            // 2. Call Backend to Update Owner
            const token = localStorage.getItem('token');
            const updateResponse = await fetch('http://localhost:3001/tickets/update-owner', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    tokenId: Number(ticket.tokenId),
                    contractAddress: ticket.nftContract,
                    newOwnerWallet: user.wallet // The new buyer's wallet
                })
            });

            if (!updateResponse.ok) {
                // Log error but don't fail the entire process
                console.error("Failed to update owner in backend:", await updateResponse.text());
                showMessage("Purchase complete, but backend update failed.", { id: toastId, type: 'error' });
            } else {
                showMessage("Purchase successful! Ticket ownership updated.", { id: toastId, type: 'success' });
            }

            // Refresh the marketplace list
            setListedTickets(prev => prev.filter(t => t.listingId.toString() !== ticket.listingId.toString()));

        } catch (error) {
            console.error("Purchase failed:", error);
            showMessage(error.reason || "Purchase failed.", { id: toastId, type: 'error' });
        }

    };

    if (loading) return (
        <div className="marketplace-container">
            <PageTitle title="Secondary Marketplace" subtitle="Buy and sell tickets from other users" />
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <span>Loading marketplace...</span>
            </div>
        </div>
    );

    return (
        <div className="marketplace-container">
            <PageTitle title="Secondary Marketplace" subtitle="Buy and sell tickets from other users" />
            {listedTickets.length === 0 ? (
                <div className="empty-state">
                    <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <h3>No tickets are currently for sale.</h3>
                    <p>Check back later or list one of your own from your profile!</p>
                </div>
            ) : (
                <div className="marketplace-grid">
                    {listedTickets.map(ticket => {
                        // Helper function to find attributes from the metadata
                        const findAttr = (trait_type) => {
                            const attr = ticket.attributes?.find(a => a.trait_type === trait_type);
                            return attr ? attr.value : 'N/A';
                        };
                        const eventDate = findAttr('Date');
                        const eventVenue = findAttr('Venue');

                        // Format the date for display
                        const formattedDate = eventDate !== 'N/A'
                            ? new Date(eventDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })
                            : 'N/A';

                        // Shorten seller address
                        const shortenedSeller = `${ticket.seller.slice(0, 6)}...${ticket.seller.slice(-4)}`;

                        return (
                            <div key={ticket.listingId.toString()} className="ticket-card">
                                {/* Event Banner */}
                                <div className="event-banner-container">
                                    <img
                                        src={ticket.image}
                                        alt={ticket.name}
                                        className="event-banner"
                                    />
                                    <div className="banner-overlay"></div>
                                    <div className="event-name-badge">
                                        <h3 className="event-name">{ticket.name}</h3>
                                    </div>
                                </div>

                                {/* Ticket Details */}
                                <div className="ticket-details">
                                    <div className="detail-row">
                                        <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="detail-label">Seller</span>
                                        <span className="detail-value seller">{shortenedSeller}</span>
                                    </div>

                                    <div className="detail-row">
                                        <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="detail-label">Venue</span>
                                        <span className="detail-value">{eventVenue}</span>
                                    </div>

                                    <div className="detail-row">
                                        <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="detail-label">Date</span>
                                        <span className="detail-value">{formattedDate}</span>
                                    </div>
                                </div>

                                {/* Price Section */}
                                <div className="price-section">
                                    <span className="price-label">Price</span>
                                    <div className="price-value">
                                        {ethers.formatEther(ticket.price)}
                                        <span className="price-currency">ETH</span>
                                    </div>
                                </div>

                                {/* Buy Button */}
                                <button
                                    onClick={() => handleBuyTicket(ticket)}
                                    className="buy-button"
                                >
                                    <span>Buy Ticket</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MarketplacePage;