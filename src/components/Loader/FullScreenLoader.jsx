import React from 'react';
import './FullScreenLoader.css';

const FullScreenLoader = ({ text = "Loading..." }) => {
    return (
        <div className="fullscreen-loader-container">
            <div className="premium-loader">
                <div className="loader-ring"></div>
                <div className="loader-ring"></div>
                <div className="loader-core">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#gradient)" />
                        <defs>
                            <linearGradient id="gradient" x1="2" y1="3" x2="22" y2="21.35" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#f472b6" />
                                <stop offset="1" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
            <p className="loader-text">{text}</p>
        </div>
    );
};

export default FullScreenLoader;
