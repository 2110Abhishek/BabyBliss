import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../context/Authcontext';
import { useNavigate } from 'react-router-dom';
import './NotificationPopup.css';

const NotificationPopup = () => {
    const [popupNotification, setPopupNotification] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            checkNewNotifications();
        }
    }, [user]);

    const checkNewNotifications = async () => {
        try {
            // Fetch latest unread notification
            const res = await axios.get(`https://blissbloomlybackend.onrender.com/api/notifications/user/${user.uid}`);
            const unread = res.data.filter(n => !n.isRead);

            if (unread.length > 0) {
                // Show the most recent unread notification
                setPopupNotification(unread[0]);
            }
        } catch (error) {
            console.error("Failed to check notifications", error);
        }
    };

    const handleClose = async () => {
        if (popupNotification) {
            await markAsRead(popupNotification._id);
            setPopupNotification(null);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`https://blissbloomlybackend.onrender.com/api/notifications/${id}/read`, { uid: user.uid });
        } catch (e) {
            console.error(e);
        }
    };

    const handleAction = () => {
        if (popupNotification?.data?.url) {
            navigate(popupNotification.data.url);
            handleClose();
        } else {
            handleClose();
        }
    };

    if (!popupNotification) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="notification-popup-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="notification-popup"
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 50 }}
                >
                    <button className="popup-close" onClick={handleClose}><FiX /></button>

                    <div className="popup-icon">
                        <FiBell />
                    </div>

                    <h3>{popupNotification.title}</h3>
                    <p>{popupNotification.body}</p>

                    <button className="popup-btn" onClick={handleAction}>
                        {popupNotification.data?.url ? 'View Now' : 'Got it'}
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NotificationPopup;
