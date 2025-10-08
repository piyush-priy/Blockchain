import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import axios from 'axios';

// Configuration for the central marketplace contract
import { MARKETPLACE_ADDRESS } from '../config.js';
import marketplaceAbi from 'E:/web/blc/show-booking-app/artifacts/contracts/Marketplace.sol/Marketplace.json';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // --- State Management ---
    // **THE FIX IS HERE**: Standardized state to use 'currentUser' instead of 'user'
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    
    // Blockchain-related state
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [marketplaceContract, setMarketplaceContract] = useState(null);

    // --- Effects ---

    // On initial load, check for existing user session in localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        // **THE FIX IS HERE**: Looking for 'currentUser' in localStorage for consistency
        const storedUser = localStorage.getItem('currentUser'); 
        if (storedToken && storedUser) {
            setToken(storedToken);
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);
    
    // Fetch all events from the backend when the component mounts
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:3001/events');
                setEvents(response.data.events);
            } catch (error) {
                toast.error("Could not fetch events from the server.");
                console.error("Error fetching events:", error);
            }
        };
        fetchEvents();
    }, []);

    // --- Wallet & Blockchain Functions ---
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
        } catch (error) {
            console.error("Error connecting to wallet:", error);
            toast.error("Failed to connect wallet.");
        }
    };

    // --- API & User Management Functions ---
    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:3001/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            // **THE FIX IS HERE**: Storing the user object under the 'currentUser' key
            localStorage.setItem('currentUser', JSON.stringify(user));

            setToken(token);
            // **THE FIX IS HERE**: Updating the 'currentUser' state
            setCurrentUser(user);

            toast.success("Login successful!");
            return true;
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.response?.data?.error || "Invalid credentials.");
            return false;
        }
    };

    const register = async (email, password, role, walletAddress) => {
        try {
            await axios.post('http://localhost:3001/register', { email, password, role, walletAddress });
            toast.success("Registration successful! Please log in.");
            return { success: true };
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error.response?.data?.error || "Registration failed.");
            return { success: false, message: error.response?.data?.error };
        }
    };

    const logout = () => {
        // **THE FIX IS HERE**: Clearing the 'currentUser' state
        setCurrentUser(null);
        setToken(null);
        setAccount(null);
        setProvider(null);
        setMarketplaceContract(null);
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
        // **THE FIX IS HERE**: Providing 'currentUser' to the rest of the app
        currentUser, 
        token,
        events,
        setEvents,
        selectedEvent,
        setSelectedEvent,
        account,
        provider,
        connectWallet,
        marketplaceContract,
        login,
        logout,
        register,
        showMessage,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

