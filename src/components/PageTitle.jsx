import React from 'react';

const PageTitle = ({ title, subtitle }) => (
    <div className="mb-8">
        <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{title}</h2>
        {subtitle && <p className="mt-4 text-xl text-gray-400">{subtitle}</p>}
    </div>
);

export default PageTitle;
