import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const WalletConnectModal = () => {
    // Get the connectWallet and logout functions from the context
    const { connectWallet, logout } = useContext(AppContext);

    return (
        // This is a full-screen overlay (z-50 ensures it's on top)
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex items-center justify-center">
            <div className="bg-gray-800 p-10 rounded-lg shadow-2xl max-w-md w-full text-center border border-gray-700">
                <h2 className="text-3xl font-bold text-cyan-400 mb-4">
                    Wallet Required
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                    To continue, please connect your MetaMask wallet. Your wallet address will be securely saved to your profile.
                </p>
                
                <div className="space-y-4">
                    <button
                        onClick={connectWallet}
                        className="w-full px-6 py-3 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 text-lg"
                    >
                        Connect Wallet
                    </button>
                    <button
                        onClick={logout}
                        className="w-full px-6 py-2 font-medium text-gray-400 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WalletConnectModal;