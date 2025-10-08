import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import { AppContext } from '../context/AppContext';
import PageTitle from '../components/PageTitle';
import NftTicketCard from '../components/NftTicketCard';
import MarketplaceABI from '../../artifacts/contracts/Marketplace.sol/Marketplace.json';
import TicketNFTABI from '../../artifacts/contracts/TicketNFT.sol/TicketNFT.json';
import { MARKETPLACE_ADDRESS } from '../config';


// Modal component for displaying QR code or Sell options
const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50" onClick={onClose}>
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
);

const UserProfilePage = () => {
    const { user, provider, showMessage } = useContext(AppContext);
    const [myTickets, setMyTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [modalView, setModalView] = useState(null); // 'qr' or 'sell'
    const [sellPrice, setSellPrice] = useState('');

    useEffect(() => {
        const fetchMyTickets = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3001/tickets/my-tickets', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error('Could not fetch your tickets.');
                }
                const ticketsData = await response.json();
                setMyTickets(ticketsData);
            } catch (error) {
                toast.error(error.message);
                console.error("Error fetching tickets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyTickets();
    }, [user]);

    const generateQrValue = (ticket) => {
        if (!ticket || !user) return null;
        return JSON.stringify({
            tokenId: ticket.tokenId,
            walletAddress: user.wallet,
            contractAddress: ticket.contractAddress // Crucial for multi-contract support
        });
    };

    const handleSellTicket = async () => {
        if (!provider || !selectedTicket || !sellPrice) {
            showMessage("Please connect your wallet and enter a price.", "error");
            return;
        }

        const priceInWei = ethers.parseEther(sellPrice);
        showMessage("Preparing to list your ticket...", "info");

        try {
            const signer = await provider.getSigner();
            const ticketContract = new ethers.Contract(selectedTicket.contractAddress, TicketNFTABI.abi, signer);
            const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI.abi, signer);

            // 1. Check if ticket is already used via backend
            const token = localStorage.getItem('token');
            const statusRes = await fetch(`http://localhost:3001/tickets/${selectedTicket.tokenId}/${selectedTicket.contractAddress}/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const { status } = await statusRes.json();

            if (status === 'used') {
                throw new Error("Cannot sell a ticket that has already been used.");
            }

            // 2. Approve the marketplace to handle this specific NFT
            showMessage("Please approve the marketplace to handle your ticket...", "info");
            const approvalTx = await ticketContract.approve(MARKETPLACE_ADDRESS, selectedTicket.tokenId);
            await approvalTx.wait();
            
            // 3. List the ticket on the marketplace
            showMessage("Approval successful! Now, please confirm the listing...", "info");
            const listTx = await marketplaceContract.listTicket(selectedTicket.contractAddress, selectedTicket.tokenId, priceInWei);
            await listTx.wait();

            showMessage("Your ticket has been successfully listed on the marketplace!", "success");
            // Remove the ticket from the local state to update the UI
            setMyTickets(prev => prev.filter(t => t.tokenId !== selectedTicket.tokenId || t.contractAddress !== selectedTicket.contractAddress));
            
        } catch (error) {
            console.error("Failed to list ticket:", error);
            showMessage(`Error: ${error.reason || error.message}`, "error");
        } finally {
            setSelectedTicket(null);
            setModalView(null);
            setSellPrice('');
        }
    };
    

    if (loading) {
        return <div className="text-center py-20 text-white">Loading your tickets...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <PageTitle title="My Tickets" subtitle="Here are all the event tickets you own" />
            
            {myTickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {myTickets.map((ticket) => (
                        <NftTicketCard
                            key={ticket.tokenId + ticket.contractAddress}
                            tokenId={ticket.tokenId}
                            metadata={{
                                name: `Ticket for ${ticket.eventName}`,
                                image: ticket.eventPosterUrl,
                                attributes: [
                                    { trait_type: "Date", value: ticket.eventDate },
                                    { trait_type: "Venue", value: ticket.eventVenue },
                                    { trait_type: "Status", value: ticket.ticketStatus },
                                ]
                            }}
                            actions={
                                <div className="flex space-x-2 mt-4">
                                    <button
                                        onClick={() => { setSelectedTicket(ticket); setModalView('qr'); }}
                                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg"
                                    >
                                        Show QR
                                    </button>
                                    <button
                                        onClick={() => { setSelectedTicket(ticket); setModalView('sell'); }}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
                                    >
                                        Sell
                                    </button>
                                </div>
                            }
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-xl text-gray-400 mt-12">You do not own any tickets yet.</p>
            )}

            {selectedTicket && (
                <Modal onClose={() => { setSelectedTicket(null); setModalView(null); }}>
                    {modalView === 'qr' && (
                        <div className='flex flex-col items-center bg-white p-6 rounded-lg'>
                            <h3 className="text-center text-2xl font-bold mb-4 text-black">Scan at Venue</h3>
                            <QRCodeSVG
                                value={generateQrValue(selectedTicket)}
                                size={256}
                                level={"H"}
                                includeMargin={true}
                            />
                            <p className="text-center text-sm mt-4 text-gray-600">Token ID: {selectedTicket.tokenId}</p>
                        </div>
                    )}
                    {modalView === 'sell' && (
                        <div>
                            <h3 className="text-center text-2xl font-bold mb-4 text-white">Sell Your Ticket</h3>
                            <p className="text-gray-300 mb-2">Ticket for: <span className="font-semibold">{selectedTicket.eventName}</span></p>
                            <p className="text-gray-400 mb-4">Token ID: {selectedTicket.tokenId}</p>
                            <input
                                type="text"
                                value={sellPrice}
                                onChange={(e) => setSellPrice(e.target.value)}
                                placeholder="Enter price in ETH (e.g., 0.05)"
                                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button
                                onClick={handleSellTicket}
                                className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg"
                            >
                                Confirm & List Ticket
                            </button>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
};

export default UserProfilePage;

