import React, { useState, useContext } from 'react';
// 1. Import the correct scanner component based on your file
import { Scanner } from '@yudiel/react-qr-scanner'; 
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';
import { AppContext } from '../context/AppContext';
import PageTitle from '../components/PageTitle';
import TicketNFT from '../../artifacts/contracts/TicketNFT.sol/TicketNFT.json';

const ScannerPage = () => {
    // 2. Need currentUser (renamed to user) and provider
    const { provider, currentUser: user, showMessage } = useContext(AppContext); 
    const [isScanning, setIsScanning] = useState(true);
    const [scannedData, setScannedData] = useState(null); // Keep track of scanned data
    const [verificationStatus, setVerificationStatus] = useState({
        status: 'idle', // 'idle', 'validating', 'burning', 'success', or 'error'
        message: 'Point the camera at a ticket QR code.'
    });

    const handleDecode = async (result) => {
        // Prevent multiple rapid scans
        if (!isScanning) return; 
        
        setIsScanning(false); // Stop scanning while processing
        const toastId = toast.loading('Processing QR code...');
        setVerificationStatus({ status: 'validating', message: 'Processing QR code...' });

        try {
            // 3. Parse QR Data
            const qrData = JSON.parse(result);
            const { tokenId, walletAddress, contractAddress } = qrData;

            if ((!tokenId && tokenId !== 0) || !walletAddress || !contractAddress) {
                throw new Error("Invalid QR code format. Key data missing.");
            }
            
            // Check provider connection (essential for signing)
            if (!provider || !user) {
                throw new Error("Wallet provider not found or user not logged in. Please connect wallet and log in.");
            }
            setScannedData(qrData); // Store valid scanned data

            // --- STEP 1: Off-Chain Verification (Check DB Status FIRST) ---
            setVerificationStatus({ status: 'validating', message: 'Checking ticket status with server...' });
            toast.loading('Checking ticket status...', { id: toastId });

            const token = localStorage.getItem('token');
            const statusResponse = await fetch(`http://localhost:3001/tickets/${tokenId}/${contractAddress}/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statusData = await statusResponse.json();

            if (!statusResponse.ok) {
                throw new Error(statusData.message || 'Failed to fetch ticket status.');
            }
            if (statusData.status !== 'valid') {
                throw new Error(`Ticket already marked as '${statusData.status}'. Cannot admit.`);
            }

            // --- STEP 2: On-Chain Ownership Verification ---
            setVerificationStatus({ status: 'validating', message: 'Verifying ownership on blockchain...' });
            toast.loading('Verifying ownership...', { id: toastId });

            const contract = new ethers.Contract(contractAddress, TicketNFT.abi, provider);
            const owner = await contract.ownerOf(tokenId);
                
            // Compare current owner on-chain with the address in the QR code
            if (owner.toLowerCase() !== walletAddress.toLowerCase()) {
                throw new Error(`Ownership mismatch. On-chain owner (${owner.slice(0, 6)}...) does not match QR code.`);
            }

            // --- STEP 3: Initiate On-Chain Burn ---
            setVerificationStatus({ status: 'burning', message: 'Ownership verified. Preparing to burn ticket...' });
            toast.loading('Please confirm burn transaction in wallet...', { id: toastId });

            const signer = await provider.getSigner();
            const ticketContractWithSigner = contract.connect(signer);

            // Check if the current user (scanner) is the contract owner
            const contractOwner = await ticketContractWithSigner.owner();
            const signerAddress = await signer.getAddress();
            if (contractOwner.toLowerCase() !== signerAddress.toLowerCase()) {
                throw new Error("Scanner wallet is not the owner of this event contract. Cannot burn ticket.");
            }

            const burnTx = await ticketContractWithSigner.burnTicket(tokenId);
            setVerificationStatus({ status: 'burning', message: 'Burning ticket on blockchain... Please wait.' });
            await burnTx.wait(); // Wait for transaction confirmation

            // --- STEP 4: Confirm Burn with Backend (Update DB) ---
            setVerificationStatus({ status: 'burning', message: 'Confirming burn with server...' });
            toast.loading('Confirming burn...', { id: toastId });

            // **YOU NEED TO IMPLEMENT THIS BACKEND ENDPOINT**
            // It should update the ticket status to 'used' or 'burned'
            const confirmResponse = await fetch(`http://localhost:3001/tickets/confirm-burn`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ tokenId, contractAddress }) // Send necessary info
            });

            if (!confirmResponse.ok) {
                // Log error but don't fail the whole process if backend update fails
                console.error("Failed to confirm burn with backend:", await confirmResponse.text());
                toast.error('On-chain burn successful, but failed to update server status.', { id: toastId, duration: 5000 });
                setVerificationStatus({ status: 'success', message: `SUCCESS (Server Sync Issue): Ticket #${tokenId} burned on-chain. Admit guest.` });

            } else {
                 toast.success('Ticket Valid & Burned!', { id: toastId, duration: 5000 });
                 setVerificationStatus({ status: 'success', message: `SUCCESS: Ticket #${tokenId} burned. Admit guest.` });
            }

        } catch (error) {
            console.error("Verification/Burn failed:", error);
            const errorMessage = error.reason || error.message || 'An unknown error occurred.';
            toast.error(errorMessage, { id: toastId, duration: 5000 });
            setVerificationStatus({ status: 'error', message: `ERROR: ${errorMessage}` });
        } finally {
            // Reset after a delay to allow user to see the result
            setTimeout(() => {
                setIsScanning(true); // Allow scanning again
                setScannedData(null);
                setVerificationStatus({ status: 'idle', message: 'Ready for next scan.' });
            }, 5000); 
        }
    };

    const getStatusColor = () => {
        switch (verificationStatus.status) {
            case 'success': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'validating':
            case 'burning': return 'text-yellow-400';
            default: return 'text-gray-300';
        }
    };

     // Only allow scanning if user is organizer or admin
    if (user?.role !== 'organizer' && user?.role !== 'admin') {
         return <div className="text-center py-10 text-white">Access Denied. Only organizers or admins can scan tickets.</div>;
    }
     if (!provider) {
         return <div className="text-center py-10 text-white">Please connect your organizer/admin wallet to use the scanner.</div>;
     }

    return (
        <div className="container mx-auto py-8 flex flex-col items-center">
            <PageTitle title="Ticket Scanner" subtitle="Verify tickets for event entry" />

            <div className="w-full max-w-md bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                {isScanning && ( // Only render scanner when active
                    <Scanner
                        onResult={(text, result) => handleDecode(text)}
                        onError={(error) => { /* Optional: handle minor scan errors */ }}
                        components={{ finder: false }} // Hides the viewfinder box
                        styles={{ container: { width: '100%' } }}
                    />
                )}
                {!isScanning && ( // Show placeholder while processing
                     <div className="aspect-square flex items-center justify-center bg-gray-900">
                        <p className="text-gray-500">Processing...</p>
                    </div>
                )}
            </div>

            <div className="mt-6 text-center bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-semibold mb-2">Verification Status</h3>
                <p className={`text-xl font-bold ${getStatusColor()}`}>
                    {verificationStatus.message}
                </p>
            </div>
             {/* Optional: Add a manual trigger if needed, though handleDecode runs on scan */}
             {/* {scannedData && verificationStatus.status === 'idle' && (
                <button
                    onClick={handleBurnTicket} // You'd need to adapt this if using manual trigger
                    className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md"
                >
                    Verify & Burn Ticket #{scannedData.tokenId}
                </button>
            )} */}
        </div>
    );
};

export default ScannerPage;