import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { AppContext } from '../context/AppContext';

const FeaturedEvents = () => {
    // 2. Remove 'navigate' from here
    const { events, setSelectedEvent } = useContext(AppContext);
    const navigate = useNavigate(); // 3. Initialize the navigate hook

    const [currentIndex, setCurrentIndex] = useState(0);

    // This code assumes 'isFeatured' is a property on your event objects
    const featured = events.filter(e => e.isFeatured && e.status.toLowerCase() === 'approved');

    useEffect(() => {
        if (featured.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % featured.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [featured.length]);

    if (featured.length === 0) return null;
    
    const currentEvent = featured[currentIndex];

    const handleViewEvent = () => {
        setSelectedEvent(currentEvent);
        // 4. Use the correct dynamic path for navigation
        navigate(`/event/${currentEvent.id}`);
    }

    return (
        <div className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-2xl">
            {/* Background Image */}
            <div 
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000" 
                style={{ backgroundImage: `url(${currentEvent.posterUrl})` }}
                key={currentEvent.id}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-12 text-white">
                <h2 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg mb-2">{currentEvent.title}</h2>
                <p className="max-w-xl text-lg text-gray-200 drop-shadow-md mb-6 line-clamp-2">{currentEvent.description}</p>
                <button onClick={handleViewEvent} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105 w-fit">
                    View Event
                </button>
            </div>
        </div>
    );
};

export default FeaturedEvents;