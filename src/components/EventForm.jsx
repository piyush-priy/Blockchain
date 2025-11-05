import React, { useState, useContext } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { AppContext } from '../context/AppContext';
import LayoutCreator from './LayoutCreator';

import { TICKET_NFT_FACTORY_ADDRESS, MARKETPLACE_ADDRESS } from '../config.js';
import TicketNFTFactory from '../../artifacts/contracts/TicketNFTFactory.sol/TicketNFTFactory.json';
import TicketNFT from '../../artifacts/contracts/TicketNFT.sol/TicketNFT.json';

const EventForm = ({ onEventCreated }) => {
    const { provider, showMessage, currentUser } = useContext(AppContext);
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        venue: '',
        type: 'movie',
        description: '',
        posterUrl: '',
        maxResaleCount: 3,
        priceCap: 120,
        seatLayout: null
    });
    const [loading, setLoading] = useState(false);
    const [showLayoutCreator, setShowLayoutCreator] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const val = e.target.type === 'number' ? parseFloat(value) : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.seatLayout) {
            return showMessage("Please create and save a seating layout.", "error");
        }
        if (!provider) {
            return showMessage("Please connect your wallet to create an event.", "error");
        }
        if (!currentUser || !currentUser.wallet) {
            return showMessage("User wallet information is not available. Please log in again.", "error");
        }
        if (formData.maxResaleCount < 0 || formData.priceCap < 100) {
            return showMessage("Max resales must be 0 or more, and Price Cap must be 100% or more.", "error");
        }

        setLoading(true);
        const toastId = showMessage("Deploying event contract... Please confirm in wallet.", "loading");

        try {
            const signer = await provider.getSigner();
            const factoryContract = new ethers.Contract(TICKET_NFT_FACTORY_ADDRESS, TicketNFTFactory.abi, signer);
            
            const tx = await factoryContract.createEventContract(
                formData.maxResaleCount,
                formData.priceCap
            );
            const receipt = await tx.wait();

            let newContractAddress = null;
            for (const log of receipt.logs) {
                try {
                    const parsedLog = factoryContract.interface.parseLog(log);
                    if (parsedLog && parsedLog.name === "EventContractCreated") {
                        newContractAddress = parsedLog.args.eventContract;
                        break;
                    }
                } catch (error) {
                    // This log is not from the factory, ignore it
                }
            }

            if (!newContractAddress) {
                throw new Error("Could not find EventContractCreated event in transaction receipt.");
            }
            
            toast.loading("Contract deployed! Setting marketplace address...", { id: toastId });

            const newEventContract = new ethers.Contract(newContractAddress, TicketNFT.abi, signer);
            const setMarketplaceTx = await newEventContract.setMarketplaceAddress(MARKETPLACE_ADDRESS);
            await setMarketplaceTx.wait();

            toast.loading("Marketplace set! Saving event details to database...", { id: toastId });

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, contractAddress: newContractAddress })
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.error || "Failed to save event to database.");
            }

            toast.success("Event created successfully!", { id: toastId });
            onEventCreated(responseData);

        } catch (error) {
            console.error("Event creation failed:", error);
            toast.error(`Event creation failed: ${error.reason || error.message}`, { id: toastId });
        } finally {
            setLoading(false);
        }
    };
    
    const handleSaveLayout = (layout) => {
        setFormData(prev => ({ ...prev, seatLayout: layout }));
        setShowLayoutCreator(false);
        showMessage("Seating layout saved!", "success");
    };

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-6">Create a New Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form inputs remain the same */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="name" placeholder="Event Name" onChange={handleChange} required className="bg-gray-700 text-white px-4 py-2 rounded-md" />
                    <input type="date" name="date" onChange={handleChange} required className="bg-gray-700 text-white px-4 py-2 rounded-md" />
                </div>
                <input type="text" name="venue" placeholder="Venue" onChange={handleChange} required className="bg-gray-700 text-white px-4 py-2 rounded-md w-full" />
                <input type="text" name="posterUrl" placeholder="Poster Image URL (Optional)" onChange={handleChange} className="bg-gray-700 text-white px-4 py-2 rounded-md w-full" />
                <textarea name="description" placeholder="Event Description" onChange={handleChange} required className="bg-gray-700 text-white px-4 py-2 rounded-md w-full min-h-[100px]"></textarea>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select name="type" onChange={handleChange} className="bg-gray-700 text-white px-4 py-2 rounded-md">
                        <option value="movie">Movie</option>
                        <option value="concert">Concert</option>
                        <option value="sports">Sports</option>
                    </select>
                     <input type="number" name="maxResaleCount" placeholder="Max Resales (e.g., 3)" value={formData.maxResaleCount} onChange={handleChange} className="bg-gray-700 text-white px-4 py-2 rounded-md" />
                    <input type="number" name="priceCap" placeholder="Resale Price Cap % (e.g., 120)" value={formData.priceCap} onChange={handleChange} className="bg-gray-700 text-white px-4 py-2 rounded-md" />
                </div>

                <div className="bg-gray-700 p-4 rounded-md text-center">
                    <h3 className="font-semibold text-lg text-white">Seating Arrangement</h3>
                    {formData.seatLayout ? (
                         <p className="text-green-400">Layout saved! You can edit it if needed.</p>
                    ) : (
                        <p className="text-yellow-400">No seating layout created yet.</p>
                    )}
                    <button type="button" onClick={() => setShowLayoutCreator(true)} className="mt-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md">
                        {formData.seatLayout ? 'Edit Layout' : 'Create Layout'}
                    </button>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md disabled:bg-indigo-400">
                    {loading ? 'Creating Event...' : 'Submit & Create Event'}
                </button>
            </form>

            {showLayoutCreator && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <LayoutCreator
                        onSave={handleSaveLayout}
                        onCancel={() => setShowLayoutCreator(false)} // Changed from 'onClose'
                    />
                </div>
            )}
        </div>
    );
};

export default EventForm;