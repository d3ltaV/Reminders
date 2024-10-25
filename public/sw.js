self.addEventListener('push', event => {
    console.log("SW COALLED");
    sendFakeNotification();
    let data;
    console.log('Raw event data:', event.data.text());
    if (event.data) {
        try {
            data = event.data.json(); // Attempt to parse the JSON payload
        } catch (error) {
            console.error('Error parsing push payload:', error);
            data = { title: "Default Title", body: "Default body" }; // Fallback data
        }
    } else {
        console.log('hi');
        console.log('No data in push event');
        data = { title: "Default Title", body: "Default body" }; // Fallback data
    }
    console.log('Raw event data:', event.data.text());
    console.log('Push Payload:', data);

    const options = {
        body: data.body || "Default notification body",
    };
    const title = data.title || "Default Title";
    self.registration.showNotification(title, options);
    console.log("hi");
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// self.addEventListener('push', event => {
//     console.log("SW COALLED");
//     if (!event.data) {
//         console.log('No data in push event');
//     }
//     const data = event.data.json();
//     // const data = event.data ? event.data.json() : {};
//     if (!event.data) {
//         console.log('No data in push event');
//         return;
//     }
//     console.log('Push Payload:', data);
//     const options = {
//         body: "lmao" || data.body,
//     };
//     const title = "sdfsdfsdf";
//     event.waitUntil(
//         // self.registration.showNotification(title, options) // Show the actual notification
//         navigator.serviceWorker.controller.postMessage({ action: 'temp' })
//     );
// });
function sendFakeNotification() {
    const title = "fake";
    const options = {
        body: "fake.",
    };

    self.registration.showNotification(title, options);
}

// Listen for notification click events
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event.notification);
    event.notification.close();
});

// Listen for messages from the main script
// self.addEventListener('message', event => {
//     if (event.data.action === 'sendFakeNotification') {
//         sendFakeNotification();
//     }
//     if (event.data.act)
// });
