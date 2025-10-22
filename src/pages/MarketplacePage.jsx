import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { AppContext } from '../context/AppContext';
import PageTitle from '../components/PageTitle';
import Marketplace from '../../artifacts/contracts/Marketplace.sol/Marketplace.json';
import TicketNFT from '../../artifacts/contracts/TicketNFT.sol/TicketNFT.json';
import { MARKETPLACE_ADDRESS } from '../config';

const MarketplacePage = () => {
    const { provider, showMessage, currentUser:user } = useContext(AppContext);
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

    if (loading) return <p className="text-center">Loading marketplace...</p>;

    return (
        <div className="container mx-auto px-4 py-8">
            <PageTitle title="Secondary Marketplace" subtitle="Buy and sell tickets from other users" />
            {listedTickets.length === 0 ? (
                 <div className="text-center bg-gray-800 p-8 rounded-lg">
                    <h3 className="text-xl text-white">No tickets are currently for sale.</h3>
                    <p className="text-gray-400 mt-2">Check back later or list one of your own from your profile!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                            ? new Date(eventDate).toLocaleDateString() 
                            : 'N/A';

                        return (
                            <div key={ticket.listingId.toString()} className="bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col justify-between transform hover:-translate-y-1 transition-transform">
                                <img src={ticket.image} alt={ticket.name} className="rounded-md mb-4 aspect-[2/3] object-cover"/>
                                <div>
                                    <h3 className="text-xl font-bold text-white truncate">{ticket.name}</h3>
                                    <p className="text-gray-400 text-sm truncate">Seller: {ticket.seller}</p>
                                    
                                    {/* --- ADDED DATE AND VENUE --- */}
                                    <p className="text-gray-400 text-sm truncate">Venue: {eventVenue}</p>
                                    <p className="text-gray-400 text-sm">Date: {formattedDate}</p>

                                    <p className="text-lg font-semibold text-indigo-400 mt-2">{ethers.formatEther(ticket.price)} ETH</p>
                                </div>
                                <button onClick={() => handleBuyTicket(ticket)} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                                    Buy Ticket
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
