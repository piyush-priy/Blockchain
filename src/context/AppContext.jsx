import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import axios from 'axios';

// Configuration for the central marketplace contract
import { MARKETPLACE_ADDRESS } from '../config.js';
import marketplaceAbi from '../../artifacts/contracts/Marketplace.sol/Marketplace.json';

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

    // State to control the wallet connection modal
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

    // Wrap logout in useCallback
    const logout = useCallback(() => {
        setCurrentUser(null);
        setToken(null);
        setAccount(null);
        setProvider(null);
        setMarketplaceContract(null);
        setIsWalletModalOpen(false);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        toast.success("You have been logged out.");
    }, []);

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


    // This effect runs on page load to auto-connect an existing wallet
    useEffect(() => {
        const autoConnectWallet = async () => {
            if (window.ethereum) {
                try {
                    // Check if MetaMask is already connected to this site
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

                    if (accounts.length > 0) {
                        // An account is already authorized
                        const address = accounts[0];
                        
                        // Check if the connected account matches the logged-in user
                        const storedUser = localStorage.getItem('currentUser');
                        if (storedUser) {
                            const parsedUser = JSON.parse(storedUser);
                            if (parsedUser.wallet && parsedUser.wallet.toLowerCase() !== address.toLowerCase()) {
                                // Mismatch! The user is logged in, but their active MetaMask
                                // account is not the one associated with their profile.
                                toast.warn("Active wallet doesn't match your profile. Logging out.");
                                logout();
                                return;
                            }
                        }

                        // Set up the provider and contract state
                        const web3Provider = new ethers.BrowserProvider(window.ethereum);
                        const signer = await web3Provider.getSigner();
                        const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, marketplaceAbi.abi, signer);
                        
                        setProvider(web3Provider);
                        setAccount(address);
                        setMarketplaceContract(marketplace);
                    }
                    // If accounts.length is 0, do nothing. The user is not connected.
                } catch (error) {
                    console.error("Failed to auto-connect wallet:", error);
                }
            }
        };

        autoConnectWallet();
    }, [logout]); // Depends on 'logout' (which is memoized)

    // Add a listener for MetaMask account changes
    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length === 0) {
                    // --- User disconnected their wallet ---
                    toast.error("Wallet disconnected. Please reconnect.");
                    // Clear blockchain state
                    setAccount(null);
                    setProvider(null);
                    setMarketplaceContract(null);
                    // Show the modal
                    if (currentUser) {
                         setIsWalletModalOpen(true);
                    }
                } else if (account && accounts[0].toLowerCase() !== account.toLowerCase()) {
                    // --- User switched to a different account ---
                    toast.warn("Wallet account changed. Logging out for security.");
                    logout(); // This is correct, force logout on account switch
                }
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, [account, logout, currentUser]);


    // Function to save the wallet address to the backend
    const saveWalletAddress = async (walletAddress) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Authentication session expired. Please log in again.");
            logout(); 
            return false;
        }

        const toastId = toast.loading("Saving wallet address to profile...");
        try {
            const response = await axios.put('http://localhost:3001/auth/wallet', 
                { walletAddress },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            // Based on our discussion, service returns { user: userPayload }
            if (response.data && response.data.user) {
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


    // Wallet & Blockchain Functions
    const connectWallet = async () => {
        if (!window.ethereum) {
            toast.error("Please install MetaMask to use blockchain features!");
            return;
        }
        try {
            // This line *prompts* the user to connect
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            // await web3Provider.send("eth_requestAccounts", []);
            const signer = await web3Provider.getSigner();
            const address = await signer.getAddress();
            
            setProvider(web3Provider);
            setAccount(address);

            const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, marketplaceAbi.abi, signer);
            setMarketplaceContract(marketplace);

            toast.success(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`);

            // If the user is logged in but doesn't have a wallet saved, save it.
            if (currentUser && !currentUser.wallet) {
                const saveSuccess = await saveWalletAddress(address);
                if (saveSuccess) {
                    setIsWalletModalOpen(false); // Close the modal on success
                } else {
                    toast.error("Wallet connected, but failed to save. Please try again.");
                }
            } else if (currentUser && currentUser.wallet) {
                // If they are just re-connecting, close the modal
                setIsWalletModalOpen(false);
            }

        } catch (error) {
            console.error("Error connecting to wallet:", error);
            toast.error("Failed to connect wallet.");
        }
    };

    // API & User Management Functions
    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:3001/auth/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            setToken(token);
            setCurrentUser(user);

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
    
    // Universal message display function
    const showMessage = (message, options) => {
        // If 'options' is an object containing an 'id', we update that toast.
        if (typeof options === 'object' && options !== null && options.id !== undefined) {
            const { id, type = 'info' } = options; // Default to 'info' if type is missing

            switch (type) {
                case 'success':
                    toast.success(message, { id: id }); // Use the provided id
                    break;
                case 'error':
                    toast.error(message, { id: id }); // Use the provided id
                    break;
                case 'loading':
                    toast.loading(message, { id: id }); // Use the provided id
                    break;
                default: // 'info' or any other type
                    toast(message, { id: id }); // Use the provided id
            }
        }
        // Otherwise, if options is just a string (the old way) or missing, create a new toast.
        else {
            const type = typeof options === 'string' ? options : 'info'; // Handle string type or default
            switch (type) {
                case 'success':
                    toast.success(message);
                    break;
                case 'error':
                    toast.error(message);
                    break;
                case 'loading':
                    // When creating a loading toast, RETURN the id
                    return toast.loading(message);
                default:
                    toast(message);
            }
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
            {isWalletModalOpen && <WalletConnectModal />}
        </AppContext.Provider>
    );
};