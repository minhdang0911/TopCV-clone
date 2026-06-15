import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAQKOwBNQG49rxU00mf3ZWWAVsh8XMCaMg',
  authDomain: 'attendace-push.firebaseapp.com',
  projectId: 'attendace-push',
  storageBucket: 'attendace-push.firebasestorage.app',
  messagingSenderId: '280368246533',
  appId: '1:280368246533:web:e9157965b32cf3cb19d16c',
  measurementId: 'G-4WHE5CEGX5',
};

// Reuse existing app instance (Next.js hot reload safety)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export function getMessagingInstance() {
  if (typeof window === 'undefined') return null;
  try {
    return getMessaging(app);
  } catch {
    return null;
  }
}

export async function requestFcmToken() {
  const messaging = getMessagingInstance();
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });
    return token || null;
  } catch (err) {
    console.warn('FCM token error:', err);
    return null;
  }
}

export function getFirebaseAuth() {
  return getAuth(app);
}

export { onMessage, getMessagingInstance as messaging };
