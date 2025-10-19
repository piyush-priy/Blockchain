import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import axios from 'axios';

// Configuration for the central marketplace contract
import { MARKETPLACE_ADDRESS } from '../config.js';
import marketplaceAbi from '../../artifacts/contracts/Marketplace.sol/Marketplace.json';

// --- NEW ---
// Import the new modal component
import WalletConnectModal from '../components/WalletConnectModal';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // --- State Management ---
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventsLoading, setEventsLoading] = useState(true);
    
    // Blockchain-related state
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [marketplaceContract, setMarketplaceContract] = useState(null);

    // --- NEW ---
    // State to control the wallet connection modal
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

    // --- Effects ---

    // On initial load, check for existing user session
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('currentUser'); 
        
        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setCurrentUser(parsedUser);

                // --- NEW ---
                // If user is loaded from storage but has no wallet, show modal.
                // Note: The user might have a wallet in MetaMask but not saved in our DB.
                if (!parsedUser.wallet) {
                    setIsWalletModalOpen(true);
                }

            } catch (error) {
                console.error("Failed to parse user from localStorage:", error);
                localStorage.removeItem('currentUser');
                localStorage.removeItem('token');
            }
        }
    }, []);
    
    // Fetch all events from the backend
    useEffect(() => {
        const fetchEvents = async () => {
            setEventsLoading(true);
            try {
                const response = await axios.get('http://localhost:3001/events');
                console.log("Fetched events:", response.data.events);
                setEvents(response.data.events);
            } catch (error) {
                toast.error("Could not fetch events from the server.");
                console.error("Error fetching events:", error);
            } finally {
                setEventsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // --- NEW ---
    // Function to save the wallet address to the backend
    const saveWalletAddress = async (walletAddress) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Authentication session expired. Please log in again.");
            logout(); // Log them out if token is missing
            return false;
        }

        const toastId = toast.loading("Saving wallet address to profile...");
        try {
            // As requested: PUT call to the auth module
            const response = await axios.put('http://localhost:3001/auth/wallet', 
                { walletAddress },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data && response.data.user) {
                // Backend returns the updated user object
                const updatedUser = response.data.user;
                setCurrentUser(updatedUser);
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                toast.success("Wallet saved successfully!", { id: toastId });
                return true;
            } else {
                throw new Error("Failed to save wallet. Invalid response from server.");
            }
        } catch (error) {
            console.error("Error saving wallet:", error);
            toast.error(error.response?.data?.error || "Failed to save wallet address.", { id: toastId });
            return false;
        }
    };


    // --- Wallet & Blockchain Functions ---
    // --- MODIFIED ---
    const connectWallet = async () => {
        if (!window.ethereum) {
            toast.error("Please install MetaMask to use blockchain features!");
            return;
        }
        try {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            await web3Provider.send("eth_requestAccounts", []);
            const signer = await web3Provider.getSigner();
            const address = await signer.getAddress();
            
            setProvider(web3Provider);
            setAccount(address);

            // Instantiate the one central marketplace contract
            const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, marketplaceAbi.abi, signer);
            setMarketplaceContract(marketplace);

            toast.success(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`);

            // --- NEW LOGIC ---
            // If the user is logged in but doesn't have a wallet saved, save it.
            if (currentUser && !currentUser.wallet) {
                const saveSuccess = await saveWalletAddress(address);
                if (saveSuccess) {
                    setIsWalletModalOpen(false); // Close the modal on success
                } else {
                    toast.error("Wallet connected, but failed to save. Please try again.");
                }
            }

        } catch (error) {
            console.error("Error connecting to wallet:", error);
            toast.error("Failed to connect wallet.");
        }
    };

    // --- API & User Management Functions ---
    // --- MODIFIED ---
    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:3001/auth/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            setToken(token);
            setCurrentUser(user);

            // --- NEW ---
            // Check if the user needs to connect their wallet
            if (!user.wallet) {
                setIsWalletModalOpen(true);
            }

            toast.success("Login successful!");
            return true;
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.response?.data?.error || "Invalid credentials.");
            return false;
        }
    };

    const register = async (email, password, role, firstName, lastName, walletAddress) => {
        try {
            await axios.post('http://localhost:3001/auth/register', { 
                email, 
                password, 
                role, 
                firstName, 
                lastName, 
                walletAddress 
            });
            toast.success("Registration successful! Please log in.");
            return { success: true };
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error.response?.data?.error || "Registration failed.");
            return { success: false, message: error.response?.data?.error };
        }
    };

    // --- MODIFIED ---
    const logout = () => {
        setCurrentUser(null);
        setToken(null);
        setAccount(null);
        setProvider(null);
        setMarketplaceContract(null);
        setIsWalletModalOpen(false); // --- NEW --- Close modal on logout
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        toast.success("You have been logged out.");
    };

    // Universal message display function
    const showMessage = (message, type = 'info') => {
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            case 'loading':
                return toast.loading(message);
            default:
                toast(message);
        }
    };
    
    // The value provided to all consuming components
    const value = {
        currentUser, 
        token,
        events,
        setEvents,
        eventsLoading,
        selectedEvent,
        setSelectedEvent,
        account,
        provider,
        connectWallet, // This is the updated connectWallet
        marketplaceContract,
        login,
        logout,
        register,
        showMessage,
        // Note: We don't need to export isWalletModalOpen or saveWalletAddress
        // because this context manages it internally.
    };

    return (
        <AppContext.Provider value={value}>
            {children}
            
            {/* --- NEW --- */}
            {/* This will render the modal on top of all other {children} 
                when isWalletModalOpen is true */}
            {isWalletModalOpen && <WalletConnectModal />}
        </AppContext.Provider>
    );
};