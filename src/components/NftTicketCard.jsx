import React from 'react';

const NftTicketCard = ({ tokenId, metadata, actions }) => {
    // Safely extract attributes from metadata
    const attributes = metadata?.attributes || [];
    const findAttr = (trait_type) => attributes.find(a => a.trait_type === trait_type)?.value || 'N/A';
    
    const eventName = metadata?.name || `Ticket #${tokenId}`;
    const eventDate = findAttr('Date');
    const eventVenue = findAttr('Venue');
    const ticketStatus = findAttr('Status');

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl transform hover:-translate-y-1 transition-transform duration-300 ease-in-out flex flex-col">
            <img 
                src={metadata?.image || 'https://placehold.co/400x600/1a202c/e53e3e?text=Ticket'} 
                alt={`${eventName} Poster`} 
                className="w-full h-64 object-cover" 
            />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white truncate">{eventName}</h3>
                <p className="text-sm text-gray-400 mb-2">Token ID: {tokenId}</p>
                
                <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Venue:</span>
                        <span className="text-white font-semibold">{eventVenue}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Date:</span>
                        <span className="text-white font-semibold">{eventDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`font-semibold capitalize ${ticketStatus === 'used' ? 'text-red-400' : 'text-green-400'}`}>
                            {ticketStatus}
                        </span>
                    </div>
                </div>

                <div className="mt-auto pt-4">
                    {actions}
                </div>
            </div>
        </div>
    );
};

export default NftTicketCard;

