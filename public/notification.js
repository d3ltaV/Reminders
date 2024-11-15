function requestNotificationPermission() {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            registerServiceWorkerAndSubscribe();
            reinitializeTasks();
        } else {
            console.warn('Notification permission denied.');
        }
    });
}

function reinitializeTasks() {
    fetch('/reinitialize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: userId,
        })
    })
    .then(response => {
        if (response.ok) {
            console.log('Tasks reinitialized successfully');
        } else {
            console.error('Failed to reinitialize tasks');
        }
    })
    .catch(error => {
        console.error('Error reinitializing tasks:', error);
    });
}

function showNotification(message) {
    if (Notification.permission === 'granted') {
        new Notification(message);
    }
}

function registerServiceWorkerAndSubscribe() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
                return registration.pushManager.getSubscription();
            })
            .then(subscription => {
                if (subscription) {
                    console.log('Already subscribed, unsubscribing...');
                    return subscription.unsubscribe().then(() => {
                        return fetch('/unsubscribe', {
                            method: 'POST',
                            body: JSON.stringify({ endpoint: subscription.endpoint,}),
                            headers: { 'Content-Type': 'application/json' }
                        });
                    });
                }
                return null;
            })
            .then(() => {
                const applicationServerKey = urlBase64ToUint8Array(publicVapidKey);
                return navigator.serviceWorker.ready.then(registration => {
                    return registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: applicationServerKey
                    });
                });
            })
            .then(newSubscription => {
                console.log('User is subscribed:', newSubscription);
                return fetch('/subscribe', {
                    method: 'POST',
                    body: JSON.stringify(newSubscription),
                    headers: { 'Content-Type': 'application/json' }
                });
            })
            .catch(error => {
                console.error('Service worker registration or subscription error:', error);
            });
    } else {
        console.warn('Push messaging is not supported');
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}
