import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiMaximize2, FiFileText, FiMessageSquare, FiInfo, FiClock, FiX } from 'react-icons/fi';
import './NotificationDropdown.css';

const NotificationDropdown = ({ notifications, onMarkRead, onClose, onMarkAllRead }) => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    // Group notifications by date (Today, Yesterday, Older)
    const groupedNotifications = notifications.reduce((acc, note) => {
        const date = new Date(note.createdAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let key = 'Older';
        if (date.toDateString() === today.toDateString()) {
            key = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            key = 'Yesterday';
        }

        if (!acc[key]) acc[key] = [];
        acc[key].push(note);
        return acc;
    }, {});

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <div className="notif-icon-wrapper order"><FiFileText /></div>;
            case 'chat': return <div className="notif-icon-wrapper chat"><FiMessageSquare /></div>;
            case 'alert': return <div className="notif-icon-wrapper alert"><FiInfo /></div>;
            default: return <div className="notif-icon-wrapper default"><FiInfo /></div>;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;

        return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const groupOrder = ['Today', 'Yesterday', 'Older'];
    const allRead = notifications.length > 0 && notifications.every(n => n.isRead);

    return (
        <motion.div
            className={`modern-notification-dropdown ${isCollapsed ? 'collapsed' : ''}`}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <div className="notif-header-modern">
                <h3>Notification</h3>
                <div className="notif-actions">
                    <button className="mark-read-btn" onClick={onMarkAllRead}>
                        Mark as read
                    </button>
                    <button className="expand-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
                        {isCollapsed ? <FiMaximize2 style={{ transform: 'rotate(45deg)' }} /> : <FiMaximize2 style={{ transform: 'rotate(225deg)' }} />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        className="notif-content-scroll"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {notifications.length === 0 ? (
                            <div className="empty-state">
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            groupOrder.map(group => (
                                groupedNotifications[group] && (
                                    <div key={group} className="notif-group">
                                        <h4 className="group-title">{group}</h4>
                                        {groupedNotifications[group].map(note => (
                                            <div
                                                key={note._id}
                                                className={`notif-card ${!note.isRead ? 'unread' : ''}`}
                                                onClick={() => onMarkRead(note)}
                                            >
                                                <div className="notif-left">
                                                    {getIcon(note.data?.type || 'default')}
                                                </div>
                                                <div className="notif-details">
                                                    <p className="notif-text">
                                                        <span className="notif-title-text">{note.title}</span> {note.body}
                                                    </p>
                                                    <span className="notif-timestamp">{formatTime(note.createdAt)}</span>
                                                </div>
                                                {note.isRead ? (
                                                    <div className="read-status">
                                                        <FiCheck className="tick-1" />
                                                        <FiCheck className="tick-2" />
                                                    </div>
                                                ) : (
                                                    <div className="unread-dot" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default NotificationDropdown;
