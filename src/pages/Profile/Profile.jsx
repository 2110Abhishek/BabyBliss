import React from 'react';
import { useAuth } from '../../context/Authcontext';
import AddressBook from '../../components/AddressBook/AddressBook';
import './Profile.css';

const Profile = () => {
    const { user, logout } = useAuth();

    if (!user) return <div className="profile-container">Please log in.</div>;

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-header">
                    <img
                        src={user.photoURL || 'https://ui-avatars.com/api/?name=' + user.displayName + '&background=random'}
                        alt="Profile"
                        className="profile-pic"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=' + user.displayName + '&background=random'; }}
                    />
                    <div className="profile-info">
                        <h1>{user.displayName || 'User'}</h1>
                        <p>{user.email}</p>
                        <button onClick={logout} className="logout-btn">Logout</button>
                    </div>
                </div>

                <div className="profile-content">
                    <div className="section">
                        <h2>Address Book</h2>
                        <AddressBook />
                    </div>
                    {/* Placeholder for future Order History integration */}
                </div>
            </div>
        </div>
    );
};

export default Profile;
