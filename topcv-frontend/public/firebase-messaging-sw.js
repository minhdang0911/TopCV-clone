importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAQKOwBNQG49rxU00mf3ZWWAVsh8XMCaMg',
  authDomain: 'attendace-push.firebaseapp.com',
  projectId: 'attendace-push',
  storageBucket: 'attendace-push.firebasestorage.app',
  messagingSenderId: '280368246533',
  appId: '1:280368246533:web:e9157965b32cf3cb19d16c',
});

const messaging = firebase.messaging();

// Handle background messages (browser minimized / different tab open)
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'TopCV';
  const body  = payload.notification?.body  || payload.data?.body  || '';
  const url   = payload.data?.url || '/viec-da-ung-tuyen';

  self.registration.showNotification(title, {
    body,
    icon: '/logo-192.png',
    badge: '/logo-192.png',
    data: { url },
  });
});

// Click on notification → navigate to the relevant page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/viec-da-ung-tuyen';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      const existing = wins.find((w) => w.url.includes(self.location.origin));
      if (existing) {
        existing.focus();
        existing.navigate(url);
      } else {
        clients.openWindow(url);
      }
    })
  );
});
