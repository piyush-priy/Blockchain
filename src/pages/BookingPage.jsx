import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import the useNavigate hook
import { AppContext } from '../context/AppContext.jsx';
import PageTitle from '../components/PageTitle.jsx';
import Ticket from '../components/Ticket.jsx';

const BookingPage = () => {
    // 2. Get bookingDetails from context and initialize the navigate hook
    const { bookingDetails } = useContext(AppContext);
    const navigate = useNavigate();

    // 3. Add a robust check for booking details to prevent crashes on refresh
    if (!bookingDetails) {
        return (
            <div className="container mx-auto text-center py-20">
                <h2 className="text-2xl font-bold text-yellow-400">No booking details found.</h2>
                <p className="text-gray-400 mt-2">Your booking might have been completed. Check your profile for your tickets.</p>
                {/* 4. Use correct navigation path */}
                <button onClick={() => navigate('/catalog')} className="mt-4 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700">
                    Return to Events
                </button>
            </div>
        );
    }
    
    // This component now handles a standard off-chain booking confirmation.
    // NFT confirmation logic could be added here if needed, similar to the old version.
    return (
        <div className="container mx-auto py-8">
            <PageTitle title="Booking Confirmed!" subtitle="Your ticket is ready. You can also view it in your profile." />
            <div className="max-w-lg mx-auto bg-gray-800 rounded-lg shadow-xl p-8">
                <Ticket booking={bookingDetails} />
                <div className="text-center mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    {/* 4. Use correct navigation paths */}
                    <button onClick={() => navigate('/profile')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition">
                        View My Tickets
                    </button>
                     <button onClick={() => navigate('/catalog')} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition">
                        Back to Events
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;