import React, { useState, useContext } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';
import { AppContext } from '../context/AppContext';
import PageTitle from '../components/PageTitle';
import TicketNFT from '../../artifacts/contracts/TicketNFT.sol/TicketNFT.json';

const ScannerPage = () => {
    const { provider } = useContext(AppContext);
    const [isScanning, setIsScanning] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState({
        status: 'idle', // 'idle', 'success', or 'error'
        message: 'Point the camera at a ticket QR code.'
    });

    const handleDecode = async (result) => {
        if (isScanning) {
            setIsScanning(false);
            const toastId = toast.loading('Verifying ticket...');

            try {
                // Expected QR code format: { "tokenId": number, "walletAddress": "0x...", "contractAddress": "0x..." }
                const qrData = JSON.parse(result);
                const { tokenId, walletAddress, contractAddress } = qrData;

                if ((!tokenId && tokenId !== 0) || !walletAddress || !contractAddress) {
                    throw new Error("Invalid QR code format. Key data is missing.");
                }
                
                if (!provider) {
                    throw new Error("Wallet provider not found. Please ensure your wallet is connected.");
                }

                // --- STEP 1: On-Chain Verification ---
                // Use the contractAddress from the QR code to connect to the correct event-specific contract.
                const contract = new ethers.Contract(contractAddress, TicketNFT.abi, provider);
                const owner = await contract.ownerOf(tokenId);
                
                if (owner.toLowerCase() !== walletAddress.toLowerCase()) {
                    throw new Error(`Ownership mismatch. On-chain owner is ${owner.slice(0, 6)}...`);
                }
                
                toast.loading('On-chain ownership verified. Checking entry status...', { id: toastId });

                // --- STEP 2: Off-Chain Verification (Mark as used in your database) ---
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3001/tickets/${tokenId}/mark-used`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const responseData = await response.json();
                if (!response.ok) {
                    throw new Error(responseData.error || 'Failed to mark ticket as used.');
                }
                
                toast.success('Ticket Valid & Admitted!', { id: toastId, duration: 5000 });
                setVerificationStatus({ status: 'success', message: `SUCCESS: Ticket #${tokenId} is valid. Admit guest.` });

            } catch (error) {
                toast.error(error.message, { id: toastId, duration: 5000 });
                setVerificationStatus({ status: 'error', message: `ERROR: ${error.message}` });
            } finally {
                setTimeout(() => {
                    setIsScanning(true);
                    setVerificationStatus({ status: 'idle', message: 'Ready for next scan.' });
                }, 5000); 
            }
        }
    };

    const getStatusColor = () => {
        switch (verificationStatus.status) {
            case 'success': return 'text-green-400';
            case 'error': return 'text-red-400';
            default: return 'text-gray-300';
        }
    };

    return (
        <div className="container mx-auto py-8 flex flex-col items-center">
            <PageTitle title="Ticket Scanner" subtitle="Verify tickets for event entry" />

            <div className="w-full max-w-md bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                <Scanner
                    onResult={(text, result) => handleDecode(text)}
                    onError={(error) => toast.error(error?.message)}
                    components={{ finder: false }}
                    styles={{ container: { width: '100%' } }}
                />
            </div>

            <div className="mt-6 text-center bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-semibold mb-2">Verification Status</h3>
                <p className={`text-2xl font-bold ${getStatusColor()}`}>
                    {verificationStatus.message}
                </p>
            </div>
        </div>
    );
};

export default ScannerPage;

