import React, { useState, useEffect, useContext, useRef } from 'react';
import './UserProfilePage.css';
import { ethers } from 'ethers';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { AppContext } from '../context/AppContext';
import PageTitle from '../components/PageTitle';
import NftTicketCard from '../components/NftTicketCard';
import MarketplaceABI from '../../artifacts/contracts/Marketplace.sol/Marketplace.json';
import TicketNFTABI from '../../artifacts/contracts/TicketNFT.sol/TicketNFT.json';
import { MARKETPLACE_ADDRESS } from '../config';

// Modal component remains the same
const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4" onClick={onClose}>
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
);

const UserProfilePage = () => {
    const { currentUser: user, provider, showMessage } = useContext(AppContext);
    const [myTickets, setMyTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [modalView, setModalView] = useState(null); // 'qr' or 'sell'
    const [sellPrice, setSellPrice] = useState('');
    const ticketRef = useRef(null); // 3. Create a ref for the ticket element

    useEffect(() => {
        const fetchMyTickets = async () => {
            // ... (fetch logic remains the same)
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
                console.log("Fetched tickets response:", response);
                if (!response.ok) {
                    throw new Error('Could not fetch your tickets.');
                }
                const ticketsData = await response.json();
                console.log("Fetched tickets data:", ticketsData);
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

    // QR Code data remains unchanged
    const generateQrValue = (ticket) => {
        if (!ticket || !user) return null;
        return JSON.stringify({
            tokenId: ticket.tokenId,
            walletAddress: user.wallet,
            contractAddress: ticket.event.contractAddress
        });
    };

    // 4. Implement the download logic
    const handleDownloadTicket = () => {
        if (!ticketRef.current || !selectedTicket) return;

        html2canvas(ticketRef.current, {
            backgroundColor: '#ffffff', // Ensure background is white for PNG
            scale: 2 // Increase scale for better resolution
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `ticket-${selectedTicket.event.name.replace(/\s+/g, '-')}-${selectedTicket.tokenId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error("Error generating ticket image:", err);
            showMessage("Could not download ticket.", "error");
        });
    };

    const handleSellTicket = async () => {
        // ... (sell logic remains the same)
        if (!provider || !selectedTicket || !sellPrice) {
            showMessage("Please connect your wallet and enter a price.", "error");
            return;
        }

        const priceInWei = ethers.parseEther(sellPrice);
        showMessage("Preparing to list your ticket...", "info");

        try {
            const signer = await provider.getSigner();
            const ticketContract = new ethers.Contract(selectedTicket.event.contractAddress, TicketNFTABI.abi, signer);
            const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI.abi, signer);

            const token = localStorage.getItem('token');
            const statusRes = await fetch(`http://localhost:3001/tickets/${selectedTicket.tokenId}/${selectedTicket.event.contractAddress}/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const { status } = await statusRes.json();

            if (status === 'used') {
                throw new Error("Cannot sell a ticket that has already been used.");
            }

            showMessage("Please approve the marketplace to handle your ticket...", "info");
            const approvalTx = await ticketContract.approve(MARKETPLACE_ADDRESS, selectedTicket.tokenId);
            await approvalTx.wait();

            showMessage("Approval successful! Now, please confirm the listing...", "info");
            const listTx = await marketplaceContract.listTicket(selectedTicket.event.contractAddress, selectedTicket.tokenId, priceInWei);
            await listTx.wait();

            showMessage("Your ticket has been successfully listed on the marketplace!", "success");
            setMyTickets(prev => prev.filter(t => t.tokenId !== selectedTicket.tokenId || t.event.contractAddress !== selectedTicket.event.contractAddress));

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

    const greetName = user?.firstName || user?.lastName || user?.email || (user?.wallet ? user.wallet.slice(0, 6) + '...' + user.wallet.slice(-4) : 'there');

    return (
        <div className="user-profile container mx-auto py-8">
            {/* Greeting hero */}
            <section className="up-hero">
                <div className="up-hero-card">
                    <h1 className="up-hero-title">Hey {greetName}, welcome back 👋</h1>
                    <p className="up-hero-sub">Your NFT tickets live here. View your passes, show QR at the gate, or list a seat for resale with just a tap.</p>
                </div>
            </section>

            <PageTitle title="My Tickets" subtitle="Here are all the event tickets you own" />

            {myTickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {/* Ticket mapping remains the same */}
                    {myTickets.map((ticket) => (
                        <NftTicketCard
                            key={ticket.tokenId + ticket.event.contractAddress}
                            tokenId={ticket.tokenId}
                            seatIdentifier={ticket.seatIdentifier}
                            metadata={{
                                name: `Ticket for ${ticket.event.name}`,
                                image: ticket.event.posterUrl,
                                attributes: [
                                    { trait_type: "Date", value: new Date(ticket.event.date).toLocaleDateString() },
                                    { trait_type: "Venue", value: ticket.event.venue },
                                    { trait_type: "Status", value: ticket.status },
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

            {/* --- MODIFIED QR MODAL --- */}
            {selectedTicket && modalView === 'qr' && (
                <Modal onClose={() => { setSelectedTicket(null); setModalView(null); }}>
                    {/* 5. Attach the ref to the div you want to capture */}
                    <div ref={ticketRef} className='bg-white text-gray-900 rounded-lg shadow-lg font-sans relative overflow-hidden p-0 mb-4'>
                        {/* Ticket Header */}
                        <div className="bg-gray-700 text-white p-4 text-center rounded-t-lg">
                            <h3 className="text-xl font-bold uppercase tracking-wider">{selectedTicket.event.name}</h3>
                        </div>

                        {/* Ticket Body (content remains the same) */}
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-sm">
                                <div>
                                    <p className="text-gray-500 font-semibold">ATTENDEE</p>
                                    <p className="font-medium text-gray-800">{user?.firstName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 font-semibold">SEAT</p>
                                    <p className="font-bold text-lg text-indigo-600">{selectedTicket.seatIdentifier || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 font-semibold">DATE</p>
                                    <p className="font-medium text-gray-800">{new Date(selectedTicket.event.date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 font-semibold">VENUE</p>
                                    <p className="font-medium text-gray-800">{selectedTicket.event.venue}</p>
                                </div>
                            </div>
                            <div className="my-4 border-t-2 border-dashed border-gray-300"></div>
                            <div className="flex flex-col items-center">
                                <QRCodeSVG
                                    value={generateQrValue(selectedTicket)}
                                    size={160}
                                    level={"H"}
                                    includeMargin={false}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                />
                                <p className="text-xs text-gray-500 mt-2 font-mono">Token ID: {selectedTicket.tokenId}</p>
                                <p className="text-xs text-gray-500 mt-1 font-mono">Contract: {selectedTicket.event.contractAddress.slice(0, 6)}...{selectedTicket.event.contractAddress.slice(-4)}</p>
                            </div>
                        </div>
                        <div className="absolute top-1/2 left-0 -mt-3 h-6 w-6 rounded-full bg-gray-800 transform -translate-x-1/2"></div>
                        <div className="absolute top-1/2 right-0 -mt-3 h-6 w-6 rounded-full bg-gray-800 transform translate-x-1/2"></div>
                    </div>
                    {/* 6. Add the Download Button */}
                    <button
                        onClick={handleDownloadTicket}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        Download Ticket (PNG)
                    </button>
                </Modal>
            )}

            {/* Sell Modal remains the same */}
            {selectedTicket && modalView === 'sell' && (
                <Modal onClose={() => { setSelectedTicket(null); setModalView(null); setSellPrice(''); }}>
                    <div>
                        <h3 className="text-center text-2xl font-bold mb-4 text-white">Sell Your Ticket</h3>
                        <p className="text-gray-300 mb-2">Ticket for: <span className="font-semibold">{selectedTicket.event.name}</span></p>
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
                </Modal>
            )}
        </div>
    );
};

export default UserProfilePage;