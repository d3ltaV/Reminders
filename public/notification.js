// const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const publicVapidKey = window.publicVapidKey
function requestNotificationPermission() {
    console.log("hi");
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            registerServiceWorkerAndSubscribe();
        } else {
            console.warn('Notification permission denied.');
        }
    });
}

function registerServiceWorkerAndSubscribe() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('Service Worker registered with scope:', registration.scope);
                return registration.pushManager.getSubscription()
                    .then(function(subscription) {
                        if (subscription) {
                            console.log('Already subscribed:', subscription);
                            return subscription;
                        }
                        const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);
                        return registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: convertedVapidKey
                        });
                    });
            })
            .then(function(subscription) {
                navigator.serviceWorker.controller.postMessage({ action: 'sendFakeNotification' });
                console.log('User is subscribed:', subscription);
                return fetch('/subscribe', {
                    method: 'POST',
                    body: JSON.stringify(subscription),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            })
            .catch(function(error) {
                console.error('Error during service worker registration or subscription:', error);
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
//document.getElementById('subscribeButton').addEventListener('click', requestNotificationPermission);
