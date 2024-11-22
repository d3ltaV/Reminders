self.addEventListener('push', event => {
    console.log("Push event received");
    let payload;
    try {
        payload = event.data ? event.data.json() : { title: 'ddddddddt', body: 'Default msg' };
    } catch (e) {
        console.error('Error parsing payload:', e);
        payload = { 
            title: 'Notification', 
            body: event.data ? event.data.text() : 'Default msggg' 
        };
    }
    
    console.log("Received payload:", payload);
    
    const options = {
        body: payload.body,
        data: payload.data,
        requireInteraction: false, 
        actions: [
            {
                action: 'view',
                title: 'View Task'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(payload.title, options)
    );
});
