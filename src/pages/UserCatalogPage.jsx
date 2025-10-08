import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { AppContext } from '../context/AppContext';
import PageTitle from '../components/PageTitle';
import FeaturedEvents from '../components/FeaturedEvents';
import { FilmIcon, MusicIcon, TrophyIcon } from '../components/Icons';

const UserCatalogPage = () => {
    // Remove 'navigate' from context, use the hook instead
    const { events, setSelectedEvent } = useContext(AppContext);
    const navigate = useNavigate(); // Initialize the navigate function
    const [filter, setFilter] = useState('all');
    
    // This fix converts the event status to lowercase before comparing
const approvedEvents = events.filter(e => e.status.toLowerCase() === 'approved');
    const filteredEvents = filter === 'all' ? approvedEvents : approvedEvents.filter(e => e.type === filter);

    const handleViewEvent = (event) => {
      setSelectedEvent(event);
      // Navigate to the correct, dynamic route for the specific event
      navigate(`/event/${event.id}`);
    };
    
    const FilterButton = ({ type, icon, label }) => (
        <button onClick={() => setFilter(type)} className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${filter === type ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <FeaturedEvents />
            <PageTitle title="All Events" />
            <div className="flex justify-center space-x-2 sm:space-x-4 mb-8">
                <FilterButton type="all" label="All" />
                <FilterButton type="movie" icon={<FilmIcon className="h-5 w-5"/>} label="Movies" />
                <FilterButton type="sports" icon={<TrophyIcon className="h-5 w-5"/>} label="Sports" />
                <FilterButton type="concert" icon={<MusicIcon className="h-5 w-5"/>} label="Concerts" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {filteredEvents.map(event => (
                    <div key={event.id} onClick={() => handleViewEvent(event)} className="bg-gray-800 rounded-lg overflow-hidden shadow-xl transform hover:-translate-y-2 transition-transform duration-300 ease-in-out group cursor-pointer">
                        <img src={event.posterUrl} alt={`${event.title} Poster`} className="w-full h-96 object-cover" />
                        <div className="p-4">
                            <h3 className="text-lg font-bold text-white truncate">{event.title}</h3>
                            <p className="text-sm text-gray-400 capitalize mb-2">{event.type}</p>
                            <div className="text-center bg-gray-700 text-white font-semibold py-2 rounded-lg group-hover:bg-indigo-600 transition-colors">View Details</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserCatalogPage;