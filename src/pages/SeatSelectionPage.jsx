import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { AppContext } from '../context/AppContext';
import PageTitle from '../components/PageTitle';
import TicketNFT from '../../artifacts/contracts/TicketNFT.sol/TicketNFT.json';

const SeatSelectionPage = () => {
    const { eventId } = useParams();
    const { events, provider, showMessage, currentUser:user } = useContext(AppContext);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [unavailableSeats, setUnavailableSeats] = useState([]);

    const event = events.find(e => e.id.toString() === eventId);

    // Fetch unavailable seats from the backend when the component mounts
    useEffect(() => {
        const fetchUnavailableSeats = async () => {
            if (!event) return;
            try {
                const response = await fetch(`http://localhost:3001/events/${event.id}/unavailable-seats`);
                const data = await response.json();
                if (response.ok) {
                    setUnavailableSeats(data.unavailableSeats);
                }
            } catch (error) {
                console.error("Could not fetch unavailable seats:", error);
            }
        };
        fetchUnavailableSeats();
    }, [event]);


    if (!event) return <div className="text-center py-10">Event not found.</div>;

    // Get the seat layout from the event. Default to empty values if not present.
    const { seatLayout } = event;
    const totalRows = seatLayout?.rows || 0;
    const totalCols = seatLayout?.cols || 0;
    const seatTypes = seatLayout?.seats || [];

    // Helper function to get the row name (A, B, C...) from its index
    const getRowName = (index) => String.fromCharCode(65 + index);

    // Helper function to find the price and type for a specific row index
    // It searches the `seatTypes` array to see which one this row belongs to.
    const getSeatDetailsForRow = (rowIndex) => {
      const seatType = seatTypes.find(s => s.rows.includes(rowIndex));
      if (seatType) {
        return { price: seatType.price, typeName: seatType.typeName };
      }
      // Return 0 price if row was not assigned a type
      return { price: 0, typeName: "N/A" }; 
    };

    const handleSeatClick = (seatId, price) => {
        if (unavailableSeats.includes(seatId)) return;

        setSelectedSeats(prev => {
            const isSelected = prev.some(s => s.id === seatId);
            if (isSelected) {
                return prev.filter(s => s.id !== seatId);
            } else {
                return [...prev, { id: seatId, price }];
            }
        });
    };

    const totalPrice = selectedSeats.reduce((acc, seat) => acc + seat.price, 0);

    const handleProceedToMint = async () => {
        if (selectedSeats.length === 0) {
            showMessage("Please select at least one seat.", "warning");
            return;
        }
        if (!provider || !user) {
            showMessage("Please connect your wallet first.", "error");
            return;
        }

        setIsProcessing(true);
        const totalEthInWei = ethers.parseEther(totalPrice.toString());

        showMessage(`Minting ${selectedSeats.length} ticket(s) for ${ethers.formatEther(totalEthInWei)} ETH...`, "info");

        try {
            const signer = await provider.getSigner();
            const eventContract = new ethers.Contract(event.contractAddress, TicketNFT.abi, signer);
            
            for (const seat of selectedSeats) {
                const tokenId = (await eventContract.nextTokenId()).toString();
                
                // const metadata = {
                //     name: `Ticket for ${event.name} - Seat ${seat.id}`,
                //     description: `This NFT is a valid ticket for ${event.name} at ${event.venue}.`,
                //     image: event.posterUrl,
                //     attributes: [
                //         { "trait_type": "Event", "value": event.name },
                //         { "trait_type": "Date", "value": event.date },
                //         { "trait_type": "Venue", "value": event.venue },
                //         { "trait_type": "Seat", "value": seat.id }
                //     ]
                // };

                // const tempMetadataResponse = await fetch('http://localhost:3001/metadata/temp', {
                //      method: 'POST',
                //      headers: { 'Content-Type': 'application/json' },
                //      body: JSON.stringify({ tokenId, metadata })
                // });

                // if(!tempMetadataResponse.ok) throw new Error("Failed to store temporary metadata.");

                // const { uri } = await tempMetadataResponse.json();
                
                const uri = `http://localhost:3001/tickets/metadata/${tokenId}/${event.contractAddress}`;

                const seatPriceInWei = ethers.parseEther(seat.price.toString());

                // IMPORTANT: The `value` here is for a SINGLE ticket mint
                const mintTx = await eventContract.mint(user.wallet, uri, seatPriceInWei, { value: seatPriceInWei });
                await mintTx.wait();

                const token = localStorage.getItem('token');
                await fetch('http://localhost:3001/tickets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        tokenId: tokenId,
                        eventId: event.id,
                        metadataUri: uri,
                        ownerWallet: user.wallet,
                        purchasePrice: seat.price,
                        seatInfo: seat.id
                    }),
                });
            }

            showMessage(`Successfully minted ${selectedSeats.length} ticket(s)!`, "success");
            setUnavailableSeats(prev => [...prev, ...selectedSeats.map(s => s.id)]);
            setSelectedSeats([]);
            
        } catch (error) {
            console.error("Minting failed:", error);
            showMessage(`Minting failed: ${error.reason || error.message}`, "error");
        } finally {
            setIsProcessing(false);
        }
    };
    
    return (
        <div className="container mx-auto px-4 py-8">
            <PageTitle title={`Select Seats for ${event.name}`} />
            
            <div className="bg-gray-800 p-8 rounded-lg">
                <div className="w-full h-4 bg-gray-500 rounded-t-lg mb-8 text-center text-white font-bold">SCREEN</div>

                    <div className="space-y-3">
                        {Array.from({ length: totalRows }).map((_, rowIndex) => {
                            const rowName = getRowName(rowIndex);
                            // Find the price for this specific row
                            const { price } = getSeatDetailsForRow(rowIndex); 

                            return (
                                <div key={rowIndex} className="flex items-center justify-center space-x-2">
                                    <span className="text-gray-400 font-bold w-8">{rowName}</span>
                                    
                                    {/* Loop from 0 to totalCols - 1 */}
                                    {Array.from({ length: totalCols }).map((_, seatIndex) => {
                                        const seatId = `${rowName}${seatIndex + 1}`;
                                        const isUnavailable = unavailableSeats.includes(seatId);
                                        const isSelected = selectedSeats.some(s => s.id === seatId);
                                        // A seat is disabled if unavailable OR if it has no price
                                        const isDisabled = isUnavailable || price === 0;

                                        return (
                                            <button
                                                key={seatId}
                                                onClick={() => handleSeatClick(seatId, price)}
                                                disabled={isDisabled}
                                                className={`w-10 h-10 rounded-md transition-colors ${
                                                    isUnavailable ? 'bg-red-400 cursor-not-allowed' : 
                                                    price === 0 ? 'bg-gray-900' : // "Empty" seat, no type
                                                    isSelected ? 'bg-indigo-500' : 
                                                    'bg-gray-300 hover:bg-gray-400'
                                                }`}
                                            ></button>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
            </div>

            <div className="mt-8 bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-white">Your Selection</h3>
                <div className="mt-4">
                    <p className="text-gray-300">Seats: {selectedSeats.map(s => s.id).join(', ')}</p>
                    <p className="text-2xl font-bold text-white mt-2">Total: {totalPrice.toFixed(4)} ETH</p>
                </div>
                <button
                    onClick={handleProceedToMint}
                    disabled={isProcessing || selectedSeats.length === 0}
                    className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-500"
                >
                    {isProcessing ? 'Processing...' : 'Proceed & Mint Tickets'}
                </button>
            </div>
        </div>
    );
};

export default SeatSelectionPage;

