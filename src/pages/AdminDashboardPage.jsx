import React, { useState, useEffect, useContext } from 'react';
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

    if (loading) {
        return <div className="text-center py-20">Loading dashboard...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <PageTitle title="Admin Dashboard" subtitle="Manage events and platform settings" />
            
            {/* Pending Events Section */}
            <div className="mb-12">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">Pending Approval</h3>
                {pendingEvents.length > 0 ? (
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                        <ul className="divide-y divide-gray-700">
                            {pendingEvents.map(event => (
                                <li key={event.id} className="py-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-lg font-semibold">{event.name}</p>
                                        <p className="text-sm text-gray-400">{event.venue} - {new Date(event.date).toLocaleDateString()}</p>
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
                            ))}
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
                        {/* Display list of active events */}
                    </div>
                ) : <p className="text-gray-400">No active events.</p>}
            </div>

            <div>
                <h3 className="text-2xl font-bold text-gray-500 mb-4">Completed & Cancelled Events</h3>
                 {completedEvents.length > 0 ? (
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                        {/* Display list of completed events */}
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