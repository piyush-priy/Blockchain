import React, { useState, useContext } from 'react';
import './UserCatalogPage.css';
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

    const formatDateTime = (dt) => {
        try {
            const d = new Date(dt);
            if (isNaN(d.getTime())) return 'Date TBA';
            return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
        } catch {
            return 'Date TBA';
        }
    };

    const FilterButton = ({ type, icon, label }) => (
        <button onClick={() => setFilter(type)} className={`uc-filter-btn flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${filter === type ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="user-catalog">
            {/* Hero Banner: high-level app summary, scoped with user-catalog to avoid conflicts */}
            <section className="uc-hero">
                <div className="container mx-auto px-4 py-10 sm:py-16">
                    <div className="uc-hero-card">
                        <div className="uc-hero-content">
                            <h1 className="uc-hero-title">Own your tickets. Beat the scalpers. Experience fair, fraud‑proof access to live events.</h1>
                            <p className="uc-hero-sub">
                                Welcome to a next‑generation ticketing marketplace where every ticket is an NFT you actually own.
                                Buy with confidence, resell within organizer‑set limits, and verify seats instantly on‑chain — no
                                paper, no guesswork, just transparent, trustable access to the shows you love.
                            </p>
                            <ul className="uc-hero-features">
                                <li>NFT‑backed ownership (ERC‑721)</li>
                                <li>Verified seats & transfer history</li>
                                <li>Fair, organizer‑set resale caps</li>
                                <li>Instant, wallet‑based checkout</li>
                                <li>Dashboards for organizers & fans</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-8">
                <FeaturedEvents />
                <PageTitle title="All Events" />
                <div className="uc-filters flex justify-center space-x-2 sm:space-x-4 mb-8">
                    <FilterButton type="all" label="All" />
                    <FilterButton type="movie" icon={<FilmIcon className="h-5 w-5" />} label="Movies" />
                    <FilterButton type="sports" icon={<TrophyIcon className="h-5 w-5" />} label="Sports" />
                    <FilterButton type="concert" icon={<MusicIcon className="h-5 w-5" />} label="Concerts" />
                </div>
                <div
                    id="events"
                    className="uc-grid grid gap-2 sm:gap-3 md:gap-4 grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]"
                >
                    {filteredEvents.map(event => (
                        <div key={event.id} className="flex flex-col select-none">
                            {/* Poster card */}
                            <div
                                onClick={() => handleViewEvent(event)}
                                className="relative overflow-hidden group cursor-pointer rounded-md ring-1 ring-white/5 bg-black/10"
                            >
                                <img
                                    src={event.posterUrl}
                                    alt={`${event.title || event.name} Poster`}
                                    loading="lazy"
                                    className="w-full aspect-[2/3] object-cover"
                                />
                                {/* Hover overlay with date + venue */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end">
                                    <div className="w-full p-1.5 sm:p-2 text-white">
                                        <p className="text-[10px] sm:text-[11px] font-semibold leading-tight">{formatDateTime(event.date)}</p>
                                        <p className="text-[9px] sm:text-[10px] text-gray-200 leading-tight truncate">
                                            {event.venue || event.location || event.organizer || 'Venue TBA'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Title under poster (always visible) */}
                            <h3
                                className="uc-card-title relative z-10 mt-1 px-1 text-[12px] sm:text-[21px] font-semibold leading-snug min-h-10"
                                title={event.name}
                            >
                                {event.name}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserCatalogPage;