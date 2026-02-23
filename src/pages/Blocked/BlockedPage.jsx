import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertOctagon, FiMail } from 'react-icons/fi';
import './BlockedPage.css';

const BlockedPage = () => {
    return (
        <div className="blocked-page">
            <div className="blocked-container">
                <FiAlertOctagon className="blocked-icon" />
                <h1>Account Blocked</h1>
                <p>
                    Your account has been suspended due to a violation of our terms or suspicious activity.
                </p>
                <div className="blocked-actions">
                    <a href="mailto:support@blissbloomly.com" className="btn btn-primary">
                        <FiMail /> Contact Support
                    </a>
                    <Link to="/" className="btn btn-secondary">
                        Return to Home
                    </Link>
                </div>
                <p className="support-text">
                    If you believe this is a mistake, please contact our support team.
                </p>
            </div>
        </div>
    );
};

export default BlockedPage;
