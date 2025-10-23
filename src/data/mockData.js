export const SEAT_LAYOUTS = {
    movie: {
        id: 'layout_movie_default',
        name: 'Standard Cinema',
        rows: 8,
        cols: 10,
        seats: [
            { id: 't1', typeName: 'Standard', price: 150, rows: [0, 1, 2, 3] },
            { id: 't2', typeName: 'Premium', price: 250, rows: [4, 5, 6, 7] },
        ]
    },
    concert: {
        id: 'layout_concert_default',
        name: 'Concert Arena',
        rows: 10,
        cols: 12,
        seats: [
            { id: 't1', typeName: 'General', price: 500, rows: [0, 1, 2, 3, 4] },
            { id: 't2', typeName: 'Fan Pit', price: 1200, rows: [5, 6, 7] },
            { id: 't3', typeName: 'VIP', price: 3000, rows: [8, 9] },
        ]
    },
    sports: {
        id: 'layout_sports_default',
        name: 'Sports Stadium',
        rows: 12,
        cols: 14,
        seats: [
            { id: 't1', typeName: 'Lower Tier', price: 800, rows: [0, 1, 2, 3, 4, 5] },
            { id: 't2', typeName: 'Upper Tier', price: 400, rows: [6, 7, 8, 9, 10, 11] },
        ]
    }
};

export const events = [
    { id: 1, title: 'Kalki 2898 AD', type: 'movie', posterUrl: 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:oi-discovery-catalog@@icons@@star-icon-202203010609.png,ox-24,oy-615,ow-29:ote-OC40LzEwICAyODEuN0sgVm90ZXM%3D,ots-29,otc-FFFFFF,oy-612,ox-70:q-80/et00352941-bdftnqnebu-portrait.jpg', date: '2025-10-15T19:00', organizer: 'EventCorp', status: 'approved', seatLayout: SEAT_LAYOUTS.movie, unavailableSeats: [5, 12, 23, 45, 51, 60] },
    { id: 2, title: 'Local Football Derby', type: 'sports', posterUrl: 'https://placehold.co/400x600/1a202c/e53e3e?text=Sports+Event', date: '2025-10-18T15:00', organizer: 'EventCorp', status: 'approved', seatLayout: SEAT_LAYOUTS.sports, unavailableSeats: [1, 10, 20, 35, 50, 68, 88] },
    { id: 3, title: 'Rock Revival Concert', type: 'concert', posterUrl: 'https://placehold.co/400x600/1a202c/e53e3e?text=Music+Concert', date: '2025-11-01T20:00', organizer: 'EventCorp', status: 'approved', seatLayout: SEAT_LAYOUTS.concert, unavailableSeats: [3, 11, 25, 41, 55, 70] },
    { id: 4, title: 'Standup Comedy Night', type: 'concert', posterUrl: 'https://placehold.co/400x600/1a202c/e53e3e?text=Comedy+Show', date: '2025-10-25T20:00', organizer: 'EventCorp', status: 'pending', seatLayout: SEAT_LAYOUTS.movie, unavailableSeats: [] },
];

// --- FIX: Changed from 'initialUsers' object to 'users' array ---
export const users = [
    { id: 1, email: 'user@test.com', password: 'password', role: 'user', name: 'Alex', wallet: '0x...placeholder_user_wallet' },
    { id: 2, email: 'admin@test.com', password: 'password', role: 'admin', name: 'Admin', wallet: '0x...placeholder_admin_wallet' },
    { id: 3, email: 'organizer@test.com', password: 'password', role: 'organizer', name: 'EventCorp', wallet: '0x...placeholder_org_wallet' },
];