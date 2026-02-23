import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/Authcontext';
import { FiCheckCircle } from 'react-icons/fi';
import './SellerPage.css';
import SellerDashboard from './SellerDashboard';

const SellerPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Seller Status State
    const [isCheckingSeller, setIsCheckingSeller] = useState(true);
    const [sellerStatus, setSellerStatus] = useState(null); // 'pending', 'approved', 'none'
    const [sellerProfile, setSellerProfile] = useState(null);


    // Check if user is a seller
    React.useEffect(() => {
        const checkSellerStatus = async () => {
            if (!user?.uid) {
                setIsCheckingSeller(false);
                return;
            }

            try {
                const res = await api.get(`/sellers/me?uid=${user.uid}`);
                setSellerProfile(res.data);
                setSellerStatus(res.data.verificationStatus); // 'pending', 'approved', 'rejected'
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setSellerStatus('none');
                } else {
                    console.error("Failed to check seller status", err);
                }
            } finally {
                setIsCheckingSeller(false);
            }
        };

        checkSellerStatus();
    }, [user?.uid]); // Use uid (primitive) not the whole user object to avoid infinite loop

    // 1. Not Logged In
    if (!user) {
        return (
            <div className="seller-page">
                <div className="container">
                    <div className="seller-header">
                        <h1>Sell Your Product</h1>
                        <p>Join our community of sellers.</p>
                    </div>
                    <div className="seller-form-container" style={{ textAlign: 'center' }}>
                        <div className="error-banner">
                            You must be logged in to sell.
                        </div>
                        <button
                            className="submit-btn"
                            onClick={() => navigate('/login?redirect=/sell', { state: { from: '/sell' } })}
                            style={{ maxWidth: '200px', margin: '20px auto' }}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Loading Status
    if (isCheckingSeller) {
        return (
            <div className="seller-page">
                <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Verifying Seller Account...</p>
                </div>
            </div>
        );
    }

    // 3. Not Registered -> Redirect to Register
    if (sellerStatus === 'none') {
        return (
            <div className="seller-page">
                <div className="container">
                    <div className="seller-header">
                        <h1>Become a Seller</h1>
                        <p>You need to register as a merchant before selling.</p>
                    </div>
                    <div className="seller-form-container" style={{ textAlign: 'center' }}>
                        <p>It only takes a few minutes to set up your business profile.</p>
                        <button
                            className="submit-btn"
                            onClick={() => navigate('/sell/register')}
                            style={{ maxWidth: '250px', margin: '20px auto' }}
                        >
                            Register Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Pending Approval
    if (sellerStatus === 'pending') {
        return (
            <div className="seller-page">
                <div className="container">
                    <div className="seller-header">
                        <h1>Application Pending</h1>
                    </div>
                    <div className="seller-form-container" style={{ textAlign: 'center' }}>
                        <FiCheckCircle size={50} color="#ff9f43" />
                        <h2>Under Review</h2>
                        <p>Your seller application is currently being reviewed by our team.</p>
                        <p>You will be able to list products once approved.</p>
                        <button className="secondary" onClick={() => navigate('/')}>Back to Home</button>
                    </div>
                </div>
            </div>
        );
    }

    // 5. Approved -> Show Dashboard
    return (
        <div className="seller-page">
            <div className="container">
                <div className="seller-header">
                    <h1>Seller Dashboard</h1>
                    <p>Welcome back, {sellerProfile?.businessName || 'Seller'}!</p>
                </div>
                <SellerDashboard />
            </div>
        </div>
    );
};

export default SellerPage;
