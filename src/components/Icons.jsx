import React from 'react';

// Each function is a React component that returns an SVG.
// The `className` prop allows us to style them easily.

export const TicketIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18m-3 .75h18A2.25 2.25 0 0021 16.5V7.5A2.25 2.25 0 0018.75 6H3.75A2.25 2.25 0 001.5 8.25v8.25A2.25 2.25 0 003.75 18.75z" />
    </svg>
);

export const UserCircleIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const QrCodeIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V7.5a3 3 0 00-3-3H3.75zM13.5 10.5V15h3.375m-3.375 0h3.375m-3.375-4.5h3.375m0-3.375V15m-3.375-4.5H6.375m0-3.375v3.375m0 0H10.5m-4.125 0H6.375m3.375 0h.008v.008h-.008v-.008zm0 3.375h.008v.008h-.008v-.008zm0 3.375h.008v.008h-.008v-.008z" />
    </svg>
);

export const BuildingStorefrontIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A.75.75 0 0114.25 12h.75c.414 0 .75.336.75.75v7.5m-4.5 0v-7.5A.75.75 0 0110.5 12h.75c.414 0 .75.336.75.75v7.5m-4.5 0v-7.5A.75.75 0 016.75 12h.75c.414 0 .75.336.75.75v7.5m6-15l-3-3m0 0l-3 3m3-3v12.75A1.5 1.5 0 0112 21H4.5A1.5 1.5 0 013 19.5V6.75A1.5 1.5 0 014.5 5.25h15A1.5 1.5 0 0121 6.75V19.5A1.5 1.5 0 0119.5 21H12a1.5 1.5 0 01-1.5-1.5V6z" />
    </svg>
);


export const FilmIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3.75v3.75m-3.75-3.75v3.75m-3.75-3.75v3.75m9-15l-3.75-3.75L9 3m3.75 3.75L16.5 3m-3.75 3.75v1.5m-3.75-3.75v1.5m-3.75-3.75v1.5m9 3.75l3.75 3.75L15 12m-3.75-3.75L7.5 12m-3.75-3.75L6 12m-3.75 3.75L6 12m-3.75 3.75L6 12m9-3.75l3.75 3.75L15 12m-3.75-3.75L7.5 12m-3.75-3.75L6 12m-3.75 3.75L6 12" />
    </svg>
);

export const MapPinIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
);

export const TrophyIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 011.373-5.625m7.254 5.625a9.75 9.75 0 001.373-5.625m-8.627 5.625c1.151-.423 2.396-.725 3.687-.916m4.94 0c1.29.191 2.536.493 3.687.916M9 12.75a3 3 0 116 0 3 3 0 01-6 0zM12 15V5.25m0 9.75a9.75 9.75 0 01-4.313 1.166m4.313-1.166a9.75 9.75 0 004.313 1.166m-8.627-1.166a9.75 9.75 0 01-1.373-5.625m1.373 5.625a9.75 9.75 0 001.373-5.625" />
    </svg>
);

export const MusicIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V7.5a2.25 2.25 0 012.25-2.25h1.5A2.25 2.25 0 0118 7.5v3.553" />
    </svg>
);

export const ArrowRightOnRectangleIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);