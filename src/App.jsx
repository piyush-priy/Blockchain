import React, { useContext } from 'react';
import { AppContext, AppProvider } from './context/AppContext.jsx';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate } from 'react-router-dom';

// Page Imports
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import UserCatalogPage from './pages/UserCatalogPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage.jsx';
import SeatSelectionPage from './pages/SeatSelectionPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import EventDetailPage from './pages/EventDetailPage.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx';
import ScannerPage from './pages/ScannerPage.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';

// Component Imports
import Header from './components/Header.jsx';

const AppRoutes = () => {
    const { currentUser } = useContext(AppContext);

    if (!currentUser) {
        return (
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        );
    }

    return (
        <>
            <Header />
            <main>
                <Routes>
                    <Route path="/catalog" element={<UserCatalogPage />} />
                    <Route path="/event/:eventId" element={<EventDetailPage />} />
                    <Route path="/select-seats" element={<SeatSelectionPage />} />
                    <Route path="/book" element={<BookingPage />} />
                    <Route path="/profile" element={<UserProfilePage />} />
                    <Route path="/scanner" element={<ScannerPage />} />
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    {currentUser.role === 'admin' && <Route path="/admin" element={<AdminDashboardPage />} />}
                    {currentUser.role === 'organizer' && <Route path="/organizer" element={<OrganizerDashboardPage />} />}
                    <Route path="*" element={<Navigate to="/catalog" />} />
                </Routes>
            </main>
        </>
    );
};

export default function App() {
    return (
        <AppProvider>
            <div className="bg-gray-900 min-h-screen text-white font-sans">
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                    toastOptions={{
                        style: {
                            background: '#334155',
                            color: '#fff',
                        },
                    }}
                />
                <AppRoutes />
            </div>
        </AppProvider>
    );
}