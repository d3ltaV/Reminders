async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            await unsubscribeAndClearCache();
            await registerServiceWorkerAndSubscribe();
            await reinitializeTasks();
        } else {
            console.warn('Notification permission denied.');
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
    }
}

async function unsubscribeAndClearCache() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            if (subscription) {
                // Clear subscription caches
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName.startsWith('push-subscription-')) {
                            return caches.delete(cacheName);
                        }
                    })
                );

                // Unsubscribe locally
                await subscription.unsubscribe();
                console.log('Local subscription successfully unsubscribed');

                // Notify server about unsubscription
                const response = await fetch('/subs/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: subscription.endpoint })
                });

                if (!response.ok) {
                    console.warn('Failed to notify server about unsubscription');
                } else {
                    console.log('Successfully unsubscribed on the server');
                }
            }
        } catch (error) {
            console.error('Error during unsubscribe and cache clear:', error);
            throw error;
        }
    }
}

async function reinitializeTasks() {
    try {
        const response = await fetch('/tasks/reinitialize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to reinitialize tasks');
        }
        console.log('Tasks reinitialized successfully');
    } catch (error) {
        console.error('Error reinitializing tasks:', error);
        throw error;
    }
}

async function registerServiceWorkerAndSubscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push messaging is not supported');
        throw new Error('Push messaging not supported');
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered with scope:', registration.scope);

        const applicationServerKey = urlBase64ToUint8Array(publicVapidKey);
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        });

        console.log('User is subscribed:', subscription);
        
        const response = await fetch('/subs/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Failed to subscribe on the server');
        }

        return response;
    } catch (error) {
        console.error('Service worker registration or subscription error:', error);
        throw error;
    }
}

function showNotification(message) {
    if (Notification.permission === 'granted') {
        new Notification(message);
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}
// async function requestNotificationPermission() {
//     try {
//         const permission = await Notification.requestPermission();
//         if (permission === 'granted') {
//             console.log('Notification permission granted.');
//             await registerServiceWorkerAndSubscribe();
//             await reinitializeTasks(); 
//         } else {
//             console.warn('Notification permission denied.');
//         }
//     } catch (error) {
//         console.error('Error requesting notification permission:', error);
//     }
// }
// function reinitializeTasks() {
//     return fetch('/subs/reinitialize', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             userId: userId,
//         })
//     })
//     .then(response => {
//         if (response.ok) {
//             console.log('Tasks reinitialized successfully');
//         } else {
//             console.error('Failed to reinitialize tasks');
//         }
//     })
//     .catch(error => {
//         console.error('Error reinitializing tasks:', error);
//     });
// }
// function showNotification(message) {
//     if (Notification.permission === 'granted') {
//         new Notification(message);
//     }
// }
// function registerServiceWorkerAndSubscribe() {
//     return new Promise((resolve, reject) => {
//         if ('serviceWorker' in navigator && 'PushManager' in window) {
//             navigator.serviceWorker.register('/sw.js')
//                 .then(registration => {
//                     console.log('Service Worker registered with scope:', registration.scope);
//                     return registration.pushManager.getSubscription();
//                 })
//                 .then(subscription => {
//                     if (subscription) {
//                         //clear subscription cache
//                         return caches.keys()
//                             .then(cacheNames => {
//                                 return Promise.all(
//                                     cacheNames.map(cacheName => {
//                                         // Delete all caches related to push subscriptions
//                                         if (cacheName.startsWith('push-subscription-')) {
//                                             return caches.delete(cacheName);
//                                         }
//                                     })
//                                 );
//                             })
//                             .then(() => {
//                                 // Unsubscribe locally
//                                 return subscription.unsubscribe();
//                             })
//                             .then(() => {
//                                 console.log('Local subscription successfully unsubscribed');
//                                 // Notify server about the unsubscription
//                                 return fetch('/subs/unsubscribe', {
//                                     method: 'POST',
//                                     headers: { 'Content-Type': 'application/json' },
//                                     body: JSON.stringify({ endpoint: subscription.endpoint })
//                                 });
//                             })
//                             .then(response => {
//                                 if (!response.ok) {
//                                     console.log('Failed to notify server about unsubscription');
//                                 } else {
//                                     console.log('Successfully unsubscribed on the server');
//                                 }
//                                 return null;
//                             });
//                     }
//                     return null;
//                 })
//                 .then(() => {
//                     const applicationServerKey = urlBase64ToUint8Array(publicVapidKey);
//                     return navigator.serviceWorker.ready.then(registration => {
//                         return registration.pushManager.subscribe({
//                             userVisibleOnly: true,
//                             applicationServerKey: applicationServerKey
//                         });
//                     });
//                 })
//                 .then(newSubscription => {
//                     console.log('User is subscribed:', newSubscription);
//                     return fetch('/subs/subscribe', {
//                         method: 'POST',
//                         body: JSON.stringify(newSubscription),
//                         headers: { 'Content-Type': 'application/json' }
//                     });
//                 })
//                 .then(response => {
//                     if (response.ok) {
//                         resolve(response);
//                     } else {
//                         reject(new Error('Failed to subscribe on the server'));
//                     }
//                 })
//                 .catch(error => {
//                     console.error('Service worker registration or subscription error:', error);
//                     reject(error);
//                 });
//         } else {
//             console.warn('Push messaging is not supported');
//             reject(new Error('Push messaging not supported'));
//         }
//     });
// }