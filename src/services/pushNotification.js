class PushNotificationService {
  constructor() {
    this.publicVapidKey = 'BOIjVJ4YzjQb3lxyEiosjABJnfdtyfwpzuof4XZW1UbtZpDynfigAHAXP2TzLMd6iFNkFpOALvYGGhV_9q5Evus';
  }

  // ... (keep requestPermission and sendNotification same) ...

  async subscribeToPush() {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.publicVapidKey)
      });

      localStorage.setItem('pushSubscription', JSON.stringify(subscription));

      // Sync with backend
      await this.syncSubscription(subscription);

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      return null;
    }
  }

  async syncSubscription(subscription) {
    try {
      await fetch('https://blissbloomlybackend.onrender.com/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });
      console.log('Subscription synced with backend');
    } catch (error) {
      console.error('Failed to sync subscription:', error);
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async sendNotification(title, options = {}) {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification(title, {
        body: options.body || 'New update from BlissBloomly!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        vibrate: [200, 100, 200],
        data: {
          url: window.location.href,
          timestamp: Date.now(),
          ...options.data
        },
        actions: options.actions || [
          {
            action: 'view',
            title: 'View'
          },
          {
            action: 'close',
            title: 'Close'
          }
        ],
        ...options
      });

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  async subscribeToPush() {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.publicVapidKey)
      });

      localStorage.setItem('pushSubscription', JSON.stringify(subscription));

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      return null;
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  sendDemoNotification(type = 'welcome') {
    const notifications = {
      welcome: {
        title: '👋 Welcome to BlissBloomly!',
        body: 'Get 15% off on your first order!',
        data: { type: 'promo', discount: 15 }
      },
      cart: {
        title: '🛒 Don\'t forget your cart!',
        body: 'You have items waiting in your cart',
        data: { type: 'reminder' }
      },
      sale: {
        title: '🎉 Flash Sale Alert!',
        body: 'Baby essentials at 50% off for next 2 hours',
        data: { type: 'sale' }
      },
      shipping: {
        title: '🚚 Order Shipped!',
        body: 'Your baby products are on the way',
        data: { type: 'shipping' }
      }
    };

    return this.sendNotification(
      notifications[type].title,
      notifications[type]
    );
  }
}

export default new PushNotificationService();