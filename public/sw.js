let publicVapidKey;

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SET_VAPID_KEY') {
        publicVapidKey = event.data.vapidKey;
        console.log('VAPID key set:', publicVapidKey);
    }

});


self.addEventListener('push', event => {
    console.log("Push event received");
    
    if (!event.data) {
        console.log('No data in push event');
        return;
    }
    const payload = event.data.json();  // Parse the incoming JSON payload

    const notificationBody = payload.message || 'Default notification message';  // Use 'message' from payload if available

    event.waitUntil(
        self.registration.showNotification('Push Notification', {
            body: notificationBody,  // Use the body from the payload
            // icon: '/icons/notification-icon.png', // Optional: You can add an icon for the notification
        })
    );

});
