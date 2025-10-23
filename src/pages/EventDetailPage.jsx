import React, { useContext } from 'react';
import './event-detail.css';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import PageTitle from '../components/PageTitle';

const EventDetailPage = () => {
    const { events, setSelectedEvent, eventsLoading } = useContext(AppContext);
    const { eventId } = useParams();
    const navigate = useNavigate();

    if (eventsLoading) {
        return <div className="text-center py-10 text-white">Loading event...</div>;
    }

    console.log("DEBUG: Finding event...", {
        eventIdFromUrl: eventId,
        eventIdDataType: typeof eventId,
        firstEventIdFromData: events[0]?.id,
        firstEventIdDataType: typeof events[0]?.id,
    });

    const event = events.find(e => e.id.toString() === eventId);

    if (!event) {
        return <div className="text-center py-10">Event not found.</div>;
    }

    const handlePurchaseTickets = () => {
        setSelectedEvent(event);
        navigate(`/event/${event.id}/seats`);
    };

    return (
        <div className="event-detail container mx-auto px-4 py-8">
            <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
                <div className="md:flex">
                    <div className="md:flex-shrink-0">
                        <img className="h-full w-full object-cover md:w-96" src={event.posterUrl} alt={`${event.name} Poster`} />
                    </div>
                    <div className="p-8 flex flex-col justify-between">
                        <div>
                            <PageTitle title={event.name} />
                            <p className="text-gray-400 text-lg mb-4">{new Date(event.date).toLocaleDateString()} at {event.venue}</p>
                            <p className="text-gray-300 mb-6">{event.description || "No description available."}</p>
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={handlePurchaseTickets}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition duration-300"
                            >
                                Purchase Tickets
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailPage;

