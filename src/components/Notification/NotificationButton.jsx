import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiBellOff } from 'react-icons/fi';
import pushNotificationService from '../../services/pushNotification';
import toast from 'react-hot-toast';
import './NotificationButton.css';

const NotificationButton = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setIsSubscribed(true);
    }
  }, []);

  const handleNotificationClick = async () => {
    setIsLoading(true);
    
    try {
      if (!isSubscribed) {
        const permissionGranted = await pushNotificationService.requestPermission();
        
        if (permissionGranted) {
          await pushNotificationService.subscribeToPush();
          setIsSubscribed(true);
          
          setTimeout(() => {
            pushNotificationService.sendDemoNotification('welcome');
          }, 1000);
          
          toast.success('Notifications enabled!');
        } else {
          toast.error('Please enable notifications');
        }
      } else {
        const types = ['welcome', 'cart', 'sale', 'shipping'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        await pushNotificationService.sendDemoNotification(randomType);
        toast.success('Demo notification sent!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      className={`notification-btn ${isSubscribed ? 'subscribed' : ''}`}
      onClick={handleNotificationClick}
      disabled={isLoading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isLoading ? (
        <div className="notification-btn__loading"></div>
      ) : (
        <>
          {isSubscribed ? (
            <>
              <FiBell className="notification-btn__icon" />
              <span>Send Demo Notification</span>
            </>
          ) : (
            <>
              <FiBellOff className="notification-btn__icon" />
              <span>Enable Notifications</span>
            </>
          )}
        </>
      )}
    </motion.button>
  );
};

export default NotificationButton;