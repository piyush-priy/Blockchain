import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import './RegisterPage.css';

const RegisterPage = () => {
    const { register } = useContext(AppContext);
    const navigate = useNavigate();

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

    const firstNameLabel = formData.role === 'organizer' ? 'Organizer Name' : 'First Name';
    const lastNameLabel = formData.role === 'organizer' ? 'Company Name' : 'Last Name';

    return (
        <div className="register-split-container">
            {/* Left Side - Welcome Message */}
            <div className="register-welcome-section">
                <div className="register-welcome-content">
                    <h1 className="register-welcome-title">
                        Join the Future of Ticketing
                    </h1>
                    <p className="register-welcome-subtitle">
                        Create your account and experience seamless, secure event ticketing. Whether you're attending or organizing, Ticket Chain has you covered.
                    </p>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="register-form-section">
                <div className="register-card">
                    <h2 className="text-3xl font-bold text-center text-cyan-400">Create Your Account</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                        {/* Role selector */}
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

                        {/* First Name field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400">{firstNameLabel}</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        {/* Last Name field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400">{lastNameLabel}</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        {/* Email field */}
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

                        {/* Password field */}
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

                        {/* Confirm Password field */}
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

                    <p className="text-sm text-center text-gray-400 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-cyan-400 hover:underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;