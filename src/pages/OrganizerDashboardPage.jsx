import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { AppContext } from '../context/AppContext';
import './organizer-dashboard.css';
import PageTitle from '../components/PageTitle';
import EventForm from '../components/EventForm';

import TicketNFT from '../../artifacts/contracts/TicketNFT.sol/TicketNFT.json';

const OrganizerDashboardPage = () => {
    const { currentUser: user, provider, showMessage } = useContext(AppContext);
    const [organizerEvents, setOrganizerEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('dashboard');

    const fetchOrganizerEvents = async () => {
        if (!user || user.role !== 'organizer') return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/events/organizer/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(response);
            if (!response.ok) throw new Error("Could not fetch organizer events.");

            const eventsData = await response.json();
            console.log("Fetched organizer events:", eventsData);
            if (!provider) {
                setOrganizerEvents(eventsData.map(e => ({ ...e, balance: '0.0' })));
                return;
            }

            const eventsWithBalances = await Promise.all(
                eventsData.map(async (event) => {
                    if (event.contractAddress && ethers.isAddress(event.contractAddress)) {
                        const balanceWei = await provider.getBalance(event.contractAddress);
                        const balanceEth = ethers.formatEther(balanceWei);
                        return { ...event, balance: balanceEth };
                    }
                    return { ...event, balance: '0.0' };
                })
            );

            setOrganizerEvents(eventsWithBalances);
        } catch (error) {
            console.error(error);
            showMessage(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizerEvents();
    }, [user, provider]);

    const handleWithdraw = async (event) => {
        if (!provider) {
            showMessage("Please connect your wallet.", "error");
            return;
        }
        showMessage(`Initiating withdrawal for ${event.name}...`, "info");
        try {
            const signer = await provider.getSigner();
            const eventContract = new ethers.Contract(event.contractAddress, TicketNFT.abi, signer);

            const tx = await eventContract.withdraw();
            await tx.wait();

            showMessage("Withdrawal successful! Funds are in your wallet.", "success");
            fetchOrganizerEvents(); // Refresh balances
        } catch (error) {
            console.error("Withdrawal failed:", error);
            showMessage(`Withdrawal failed: ${error.reason || error.message}`, "error");
        }
    };

    const handleEventCreated = (newEvent) => {
        setOrganizerEvents(prev => [...prev, { ...newEvent, balance: '0.0' }]);
        setView('dashboard');
    };

    return (
        <div className="organizer-dashboard container mx-auto px-4 pt-16 pb-8">
            <PageTitle title="Organizer Dashboard" />

            <div className="mb-8 flex justify-center space-x-4">
                <button onClick={() => setView('dashboard')} className={`px-6 py-2 font-semibold rounded-lg ${view === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}>My Events</button>
                <button onClick={() => setView('create')} className={`px-6 py-2 font-semibold rounded-lg ${view === 'create' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Create New Event</button>
            </div>

            {view === 'create' && <EventForm onEventCreated={handleEventCreated} />}

            {view === 'dashboard' && (
                <div>
                    {loading ? (
                        <p className="text-center">Loading your events...</p>
                    ) : organizerEvents.length === 0 ? (
                        <div className="text-center bg-gray-800 p-8 rounded-lg">
                            <h3 className="text-xl text-white">No events found.</h3>
                            <p className="text-gray-400 mt-2">Click 'Create New Event' to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {organizerEvents.map(event => (
                                <div key={event.id} className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{event.name}</h3>
                                        <p className="text-gray-400">{event.date} at {event.venue}</p>
                                        <p className={`mt-1 font-semibold ${event.status === 'Approved' ? 'text-green-400' : 'text-yellow-400'}`}>Status: {event.status}</p>
                                        <p className="text-gray-500 text-xs mt-1">Contract: {event.contractAddress}</p>
                                    </div>
                                    <div className="mt-4 md:mt-0 text-center">
                                        <p className="text-gray-400 text-sm">Contract Balance</p>
                                        <p className="text-3xl font-bold text-white">{parseFloat(event.balance).toFixed(4)} ETH</p>
                                        <button
                                            onClick={() => handleWithdraw(event)}
                                            disabled={!provider || parseFloat(event.balance) <= 0}
                                            className="mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed">
                                            Withdraw Funds
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrganizerDashboardPage;

