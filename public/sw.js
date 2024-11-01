
self.addEventListener('push', event => {
    console.log("Push event received");
    
    if (!event.data) {
        console.log('No data in push event');
        return;
    }
    event.waitUntil(
        self.registration.showNotification('Push Notification', {
            //body: event.data.text(),
            body: "yhi",
        })
    );

});