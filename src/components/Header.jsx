import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { TicketIcon, QrCodeIcon, UserCircleIcon, ArrowRightOnRectangleIcon, BuildingStorefrontIcon } from './Icons';

const Header = () => {
    // --- 1. GET WALLET STATE AND CONNECT FUNCTION FROM CONTEXT ---
    const { currentUser, logout, account, connectWallet } = useContext(AppContext);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-gray-800 shadow-lg sticky top-0 z-40">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <TicketIcon className="h-8 w-8 text-cyan-400" />
                    <h1 onClick={() => handleNavigation('/catalog')} className="text-2xl font-bold text-white tracking-wider cursor-pointer">TicketChain</h1>
                </div>
                
                {/* --- 2. DYNAMIC NAVIGATION AND ACTION BUTTONS --- */}
                <nav className="flex items-center space-x-4">
                    {/* Common Links */}
                    <button onClick={() => handleNavigation('/catalog')} className="text-gray-300 hover:text-white transition duration-150 px-3 py-2 rounded-md">Events</button>
                    <button onClick={() => handleNavigation('/marketplace')} className="flex items-center text-gray-300 hover:text-white transition duration-150 px-3 py-2 rounded-md">
                        <BuildingStorefrontIcon className="h-5 w-5 mr-1" /> Marketplace
                    </button>
                    
                    {/* Conditional rendering based on user login state */}
                    {currentUser ? (
                        <>
                            {/* Role-specific Links */}
                            {currentUser.role === 'organizer' && (
                                <button onClick={() => handleNavigation('/organizer')} className="text-gray-300 hover:text-white transition duration-150">Dashboard</button>
                            )}
                            {currentUser.role === 'admin' && (
                                <button onClick={() => handleNavigation('/admin')} className="text-gray-300 hover:text-white transition duration-150">Admin</button>
                            )}

                            {/* Wallet and User Actions */}
                            <div className="flex items-center space-x-2 border-l border-gray-700 pl-4">
                                <button onClick={() => handleNavigation('/scanner')} className="p-2 rounded-full hover:bg-gray-700" aria-label="Scan Ticket">
                                    <QrCodeIcon className="h-6 w-6 text-gray-300" />
                                </button>
                                <button onClick={() => handleNavigation('/profile')} className="p-2 rounded-full hover:bg-gray-700" aria-label="User Profile">
                                    <UserCircleIcon className="h-6 w-6 text-gray-300" />
                                </button>
                                
                                {/* --- 3. CONNECT WALLET BUTTON LOGIC --- */}
                                {account ? (
                                    <span className="bg-gray-700 text-cyan-400 text-sm font-mono px-3 py-2 rounded-lg" title={account}>
                                        {`${account.slice(0, 6)}...${account.slice(-4)}`}
                                    </span>
                                ) : (
                                    <button onClick={connectWallet} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
                                        Connect Wallet
                                    </button>
                                )}

                                <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-700" aria-label="Logout">
                                    <ArrowRightOnRectangleIcon className="h-6 w-6 text-gray-300" />
                                </button>
                            </div>
                        </>
                    ) : (
                        // --- 4. BUTTONS FOR LOGGED-OUT USERS ---
                        <div className="flex items-center space-x-2 border-l border-gray-700 pl-4">
                            <button onClick={() => handleNavigation('/login')} className="text-gray-300 hover:text-white transition duration-150 font-semibold">
                                Login
                            </button>
                            <button onClick={() => handleNavigation('/register')} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
                                Register
                            </button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
