'use client';

import { useEffect, useRef } from 'react';
import { requestFcmToken, getMessagingInstance, onMessage } from '@/lib/firebase';
import api from '@/lib/axios';

// Call this hook once when a CANDIDATE user is authenticated.
// It requests notification permission, gets the FCM token, saves it to
// the backend, and sets up a foreground message listener.
export function useFCM({ enabled, onForegroundMessage }) {
  const registered = useRef(false);

  useEffect(() => {
    if (!enabled || registered.current) return;
    registered.current = true;

    (async () => {
      const token = await requestFcmToken();
      if (!token) return;

      // Persist token on backend
      api.patch('/users/me/fcm-token', { token }).catch(() => {});

      // Foreground messages (app is in focus)
      const messaging = getMessagingInstance();
      if (!messaging) return;
      const unsub = onMessage(messaging, (payload) => {
        const title = payload.notification?.title || payload.data?.title || 'TopCV';
        const body  = payload.notification?.body  || payload.data?.body  || '';
        const url   = payload.data?.url || '/viec-da-ung-tuyen';
        onForegroundMessage?.({ title, body, url });
      });
      return unsub;
    })();
  }, [enabled]);
}
