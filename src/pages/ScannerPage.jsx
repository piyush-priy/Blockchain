import React, { useState, useContext, useRef, useEffect } from 'react';
// 1. Import the correct scanner component based on your file
import { Scanner } from '@yudiel/react-qr-scanner';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';
import { AppContext } from '../context/AppContext';
import PageTitle from '../components/PageTitle';
import TicketNFT from '../../artifacts/contracts/TicketNFT.sol/TicketNFT.json';
import jsQR from 'jsqr';

const ScannerPage = () => {
    // 2. Need currentUser (renamed to user) and provider
    const { provider, currentUser: user, showMessage } = useContext(AppContext);
    const [isScanning, setIsScanning] = useState(true);
    const [scannedData, setScannedData] = useState(null); // Keep track of scanned data
    const [verificationStatus, setVerificationStatus] = useState({
        status: 'idle', // 'idle', 'validating', 'burning', 'success', or 'error'
        message: 'Point the camera at a ticket QR code.'
    });
    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const [scannerError, setScannerError] = useState(null);

    useEffect(() => {
        if (scannerError) {
            console.error("Scanner initialization failed:", scannerError);
            toast.error("Camera access failed. You can try uploading an image instead.", { duration: 5000 });
        }
    }, [scannerError]);

    const openFilePicker = () => fileInputRef.current?.click();

    const handleImageUpload = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const toastId = toast.loading('Reading image...');
        setIsScanning(false); // pause live scanner while processing image
        setVerificationStatus({ status: 'validating', message: 'Processing uploaded image...' });
        try {
            const dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const img = await new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = dataUrl;
            });

            // Draw image to canvas (downscale max dimension for performance)
            const maxDim = 1200;
            let { width, height } = img;
            if (width > height && width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
            } else if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
            }

            let canvas = canvasRef.current;
            if (!canvas) {
                canvas = document.createElement('canvas');
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const imageData = ctx.getImageData(0, 0, width, height);

            const qr = jsQR(imageData.data, width, height, { inversionAttempts: 'dontInvert' });
            if (!qr || !qr.data) {
                throw new Error('No QR code found in the image. Try a clearer photo.');
            }

            toast.success('QR decoded from image!', { id: toastId, duration: 2500 });
            // Reuse the same flow as camera scan
            await handleDecode(qr.data);

        } catch (err) {
            console.error('Image decode failed:', err);
            toast.error(err.message || 'Failed to decode QR from image.', { id: toastId, duration: 4000 });
            setVerificationStatus({ status: 'error', message: `ERROR: ${err.message || 'Image decode failed'}` });
        } finally {
            // Reset file input so the same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
            // Resume scanning after short delay so user sees status
            setTimeout(() => setIsScanning(true), 1500);
        }
    };

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
                        // Provide both callbacks defensively; normalize into a string before passing to handleDecode
                        onDecode={(value) => {
                            const decoded = typeof value === 'string' ? value : value?.text || value?.rawValue;
                            if (decoded) {
                                try { handleDecode(decoded); } catch (e) { console.error('handleDecode failed:', e); }
                            }
                        }}
                        onResult={(text, result) => {
                            // Some builds call (text, result), others (result)
                            let decoded = undefined;
                            if (typeof text === 'string') {
                                decoded = text;
                            } else if (text && typeof text === 'object') {
                                decoded = text?.text || text?.rawValue;
                            } else if (result && typeof result === 'object') {
                                decoded = result?.text || result?.rawValue;
                            }
                            if (decoded) {
                                try { handleDecode(decoded); } catch (e) { console.error('handleDecode failed:', e); }
                            }
                        }}
                        onError={(error) => { console.debug('Scanner error:', error); }}
                        components={{ finder: true }}
                        styles={{ container: { width: '100%' } }}
                        constraints={{ facingMode: 'environment' }}
                        scanDelay={200}
                    />
                )}
                {!isScanning && ( // Show placeholder while processing
                    <div className="aspect-square flex items-center justify-center bg-gray-900">
                        <p className="text-gray-500">Processing...</p>
                    </div>
                )}
            </div>

            {/* Upload alternative */}
            <div className="mt-4 w-full max-w-md flex items-center justify-center gap-3 relative z-10">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageUpload}
                />
                <button
                    type="button"
                    onClick={openFilePicker}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-md relative z-50"
                >
                    Upload Ticket Image
                </button>
                {/* Hidden canvas for decoding if needed */}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="mt-6 text-center bg-gray-800 p-6 rounded-lg w-full max-w-md relative z-10">
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