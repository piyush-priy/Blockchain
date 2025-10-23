import React, { useState, useEffect, useContext } from 'react';
import './admin-dashboard.css';
import toast from 'react-hot-toast';
import { AppContext } from '../context/AppContext';
import PageTitle from '../components/PageTitle';

const AdminDashboardPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { api, currentUser } = useContext(AppContext); // Assuming context provides an API helper

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/events');
            if (!response.ok) {
                throw new Error('Failed to fetch events.');
            }
            const data = await response.json();
            setEvents(data.events);
        } catch (error) {
            toast.error(error.message || "Could not fetch events.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleStatusUpdate = async (eventId, newStatus) => {
        const toastId = toast.loading(`Updating status to ${newStatus}...`);
        try {
            // NOTE: In a real app, the token would be handled by a global API client (like axios interceptors)
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:3001/events/${eventId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update status.');
            }

            toast.success('Event status updated!', { id: toastId });
            // Refresh the event list to show the change
            fetchEvents();

        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    const pendingEvents = events.filter(event => event.status === 'Pending');
    const activeEvents = events.filter(event => ['Approved', 'Live'].includes(event.status));
    const completedEvents = events.filter(event => ['Completed', 'Cancelled'].includes(event.status));

    // Helper to derive seat and pricing info from possibly different seatLayout shapes
    const getEventStats = (evt) => {
        const sl = evt?.seatLayout || {};
        const rows = sl.rows || sl.rowCount || 0;
        const cols = sl.cols || sl.colCount || sl.seatsPerRow || 0;
        const totalSeats = rows * cols;

        // Support both { seats: [{ rows: [], price, typeName }] } and { tiers: { label: price } }
        let prices = [];
        if (Array.isArray(sl.seats)) {
            prices = sl.seats.map(s => Number(s.price || 0)).filter(n => !Number.isNaN(n));
        } else if (sl.tiers && typeof sl.tiers === 'object') {
            prices = Object.values(sl.tiers).map(v => Number(v || 0)).filter(n => !Number.isNaN(n));
        }
        const hasPrices = prices.length > 0;
        const minPrice = hasPrices ? Math.min(...prices) : null;
        const maxPrice = hasPrices ? Math.max(...prices) : null;
        const typeCount = Array.isArray(sl.seats) ? sl.seats.length : (sl.tiers ? Object.keys(sl.tiers).length : 0);

        return { rows, cols, totalSeats, hasPrices, minPrice, maxPrice, typeCount };
    };

    if (loading) {
        return <div className="text-center py-20">Loading dashboard...</div>;
    }

    return (
        <div className="admin-dashboard container mx-auto py-8">
            <PageTitle title="Admin Dashboard" subtitle="Manage events and platform settings" />

            {/* Pending Events Section */}
            <div className="mb-12">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">Pending Approval</h3>
                {pendingEvents.length > 0 ? (
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                        <ul className="divide-y divide-gray-700">
                            {pendingEvents.map(event => {
                                const { rows, cols, totalSeats, hasPrices, minPrice, maxPrice, typeCount } = getEventStats(event);
                                const desc = (event.description || '').trim();
                                const shortDesc = desc.length > 140 ? (desc.slice(0, 140) + '…') : desc;
                                return (
                                    <li key={event.id} className="py-5 md:py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                        <div className="space-y-1">
                                            <p className="text-lg font-semibold">{event.name}</p>
                                            <p className="text-sm text-gray-400">
                                                {event.venue} • {new Date(event.date).toLocaleDateString()} {event.type ? `• ${event.type}` : ''}
                                            </p>
                                            {shortDesc && (
                                                <p className="text-sm text-gray-400/90">{shortDesc}</p>
                                            )}
                                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-300">
                                                <span className="inline-flex items-center rounded-md bg-black/20 px-2.5 py-1 border border-white/10">
                                                    Seats: {totalSeats || '—'}{rows && cols ? ` (${rows}×${cols})` : ''}
                                                </span>
                                                <span className="inline-flex items-center rounded-md bg-black/20 px-2.5 py-1 border border-white/10">
                                                    {hasPrices ? (
                                                        <>Seat prices: {minPrice === maxPrice ? `${minPrice} ETH` : `${minPrice}–${maxPrice} ETH`} {typeCount ? `(${typeCount} types)` : ''}</>
                                                    ) : 'Seat prices: —'}
                                                </span>
                                                <span className="inline-flex items-center rounded-md bg-black/20 px-2.5 py-1 border border-white/10">
                                                    Price cap: {typeof event.priceCap === 'number' ? event.priceCap : '—'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={() => handleStatusUpdate(event.id, 'Approved')}
                                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(event.id, 'Cancelled')}
                                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ) : (
                    <p className="text-gray-400">No events are currently awaiting approval.</p>
                )}
            </div>

            {/* Other Sections (Read-only for now) */}
            <div className="mb-12">
                <h3 className="text-2xl font-bold text-cyan-400 mb-4">Active Events</h3>
                {activeEvents.length > 0 ? (
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                        <ul className="divide-y divide-gray-700">
                            {activeEvents.map(event => {
                                const { rows, cols, totalSeats, hasPrices, minPrice, maxPrice, typeCount } = getEventStats(event);
                                const desc = (event.description || '').trim();
                                const shortDesc = desc.length > 140 ? (desc.slice(0, 140) + '…') : desc;
                                return (
                                    <li key={event.id} className="py-5 md:py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                        <div className="space-y-1">
                                            <p className="text-lg font-semibold">{event.name}</p>
                                            <p className="text-sm text-gray-400">
                                                {event.venue} • {new Date(event.date).toLocaleDateString()} {event.type ? `• ${event.type}` : ''}
                                            </p>
                                            {shortDesc && (
                                                <p className="text-sm text-gray-400/90">{shortDesc}</p>
                                            )}
                                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-300">
                                                <span className="inline-flex items-center rounded-md bg-black/20 px-2.5 py-1 border border-white/10">
                                                    Seats: {totalSeats || '—'}{rows && cols ? ` (${rows}×${cols})` : ''}
                                                </span>
                                                <span className="inline-flex items-center rounded-md bg-black/20 px-2.5 py-1 border border-white/10">
                                                    {hasPrices ? (
                                                        <>Seat prices: {minPrice === maxPrice ? `${minPrice} ETH` : `${minPrice}–${maxPrice} ETH`} {typeCount ? `(${typeCount} types)` : ''}</>
                                                    ) : 'Seat prices: —'}
                                                </span>
                                                <span className="inline-flex items-center rounded-md bg-black/20 px-2.5 py-1 border border-white/10">
                                                    Price cap: {typeof event.priceCap === 'number' ? event.priceCap : '—'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <span className={`text-xs font-semibold inline-flex items-center rounded-md px-2.5 py-1 border border-white/10 ${event.status === 'Live' ? 'text-green-400 bg-green-500/10' : 'text-cyan-300 bg-cyan-500/10'}`}>
                                                {event.status}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ) : <p className="text-gray-400">No active events.</p>}
            </div>

            <div>
                <h3 className="text-2xl font-bold text-gray-500 mb-4">Completed & Cancelled Events</h3>
                {completedEvents.length > 0 ? (
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                        <ul className="divide-y divide-gray-700">
                            {completedEvents.map(event => {
                                const { rows, cols, totalSeats, hasPrices, minPrice, maxPrice, typeCount } = getEventStats(event);
                                const desc = (event.description || '').trim();
                                const shortDesc = desc.length > 140 ? (desc.slice(0, 140) + '…') : desc;
                                const statusColor = event.status === 'Cancelled' ? 'text-red-400 bg-red-500/10' : 'text-gray-300 bg-white/5';
                                return (
                                    <li key={event.id} className="py-5 md:py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                        <div className="space-y-1">
                                            <p className="text-lg font-semibold">{event.name}</p>
                                            <p className="text-sm text-gray-400">
                                                {event.venue} • {new Date(event.date).toLocaleDateString()} {event.type ? `• ${event.type}` : ''}
                                            </p>
                                            {shortDesc && (
                                                <p className="text-sm text-gray-400/90">{shortDesc}</p>
                                            )}
                                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-300">
                                                <span className="inline-flex items-center rounded-md bg-black/20 px-2.5 py-1 border border-white/10">
                                                    Seats: {totalSeats || '—'}{rows && cols ? ` (${rows}×${cols})` : ''}
                                                </span>
                                                <span className="inline-flex items-center rounded-md bg-black/20 px-2.5 py-1 border border-white/10">
                                                    {hasPrices ? (
                                                        <>Seat prices: {minPrice === maxPrice ? `${minPrice} ETH` : `${minPrice}–${maxPrice} ETH`} {typeCount ? `(${typeCount} types)` : ''}</>
                                                    ) : 'Seat prices: —'}
                                                </span>
                                                <span className="inline-flex items-center rounded-md bg-black/20 px-2.5 py-1 border border-white/10">
                                                    Price cap: {typeof event.priceCap === 'number' ? event.priceCap : '—'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <span className={`text-xs font-semibold inline-flex items-center rounded-md px-2.5 py-1 border border-white/10 ${statusColor}`}>
                                                {event.status}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ) : <p className="text-gray-400">No past events.</p>}
            </div>

        </div>
    );
};

export default AdminDashboardPage;




// Important Notes for this to Work:
// Authentication: The handleStatusUpdate function assumes you have a JWT stored in localStorage after a user logs in. You will need to implement the frontend login logic (which we haven't done yet) for this to work. For now, you could manually place a valid token in your browser's localStorage for testing.

// AppContext: This code assumes your AppContext provides an api helper or some way to get the current user's token. The quick-and-dirty localStorage.getItem('token') is used as a placeholder.