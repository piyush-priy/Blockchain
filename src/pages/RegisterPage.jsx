import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    // --- MODIFICATION HERE ---
    // Removed 'connectWallet' and 'account' as they are no longer needed
    const { register } = useContext(AppContext);
    const navigate = useNavigate();

    // --- MODIFICATION HERE ---
    // Added firstName and lastName to state
    // Re-ordered state to put 'role' first, matching the new form layout
    const [formData, setFormData] = useState({
        role: 'user',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);
        // --- MODIFICATION HERE ---
        // Calling register with new fields (firstName, lastName)
        // Passing 'null' for the walletAddress
        const result = await register(
            formData.email,
            formData.password,
            formData.role,
            formData.firstName,
            formData.lastName,
            null 
        );

        if (result.success) {
            navigate('/login');
        } else {
            setError(result.message || "Registration failed. Please try again.");
        }
        setLoading(false);
    };

    // --- MODIFICATION HERE ---
    // Storing conditional labels in variables for cleaner JSX
    const firstNameLabel = formData.role === 'organizer' ? 'Organizer Name' : 'First Name';
    const lastNameLabel = formData.role === 'organizer' ? 'Company Name' : 'Last Name';

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-cyan-400">Create Your Account</h2>
                
                {/* --- MODIFICATION HERE --- */}
                {/* Wallet Connection Button has been removed */}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* --- MODIFICATION HERE --- */}
                    {/* Role selector moved to the top */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Register as</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="user">Event Attendee</option>
                            <option value="organizer">Event Organizer</option>
                        </select>
                    </div>

                    {/* --- MODIFICATION HERE --- */}
                    {/* Added First Name field with conditional label */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400">{firstNameLabel}</label>
                        <input
                            type="text"
                            name="firstName" // Internal name is always 'firstName'
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    {/* --- MODIFICATION HERE --- */}
                    {/* Added Last Name field with conditional label */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400">{lastNameLabel}</label>
                        <input
                            type="text"
                            name="lastName" // Internal name is always 'lastName'
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Existing fields */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    
                    {error && <p className="text-sm text-center text-red-400">{error}</p>}
                    
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 font-bold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-cyan-400 hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;