import React, { useContext } from 'react';
// --- FIX: Import the QRCodeSVG component directly by name ---
import { QRCodeSVG } from 'qrcode.react';
import { AppContext } from '../context/AppContext';

const Ticket = ({ booking }) => {
    const { currentUser } = useContext(AppContext);
    
    if (!booking) {
        return <div className="text-white text-center p-4">No booking details available.</div>;
    }

    const qrValue = JSON.stringify({
        bookingId: booking.bookingId,
        user: currentUser?.email,
        event: booking.eventTitle,
        seats: booking.seatLabels,
    });
    
    return (
        <div className="bg-white text-gray-900 rounded-lg shadow-lg p-6 font-mono relative overflow-hidden">
            {/* Perforated edge effect */}
            <div className="absolute top-0 left-1/2 -ml-3 h-6 w-6 rounded-full bg-gray-800 transform -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-1/2 -ml-3 h-6 w-6 rounded-full bg-gray-800 transform translate-y-1/2"></div>

            <div className="text-center z-10">
                <p className="text-sm text-gray-500">TICKETCHAIN</p>
                <h2 className="text-2xl font-bold uppercase tracking-widest">{booking.eventTitle}</h2>
                <div className="my-4 border-t-2 border-dashed border-gray-400"></div>
                <div>
                    <p className="text-sm text-gray-600">SEATS</p>
                    <p className="text-3xl font-bold">{booking.seatLabels.join(', ')}</p>
                </div>
                <div className="my-4 border-t-2 border-dashed border-gray-400"></div>
                <div className="flex justify-center">
                    {/* --- FIX: Use the imported QRCodeSVG component directly --- */}
                    <QRCodeSVG value={qrValue} size={128} bgColor="#ffffff" fgColor="#000000" level="H" />
                </div>
                <p className="text-xs text-gray-500 mt-4">{booking.bookingId}</p>
            </div>
        </div>
    );
};

export default Ticket;