// Service Worker for Zanzirangi House PWA & Web Push Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push notification from backend
self.addEventListener('push', (event) => {
  let data = {
    title: '🔔 Zanzirangi House Support',
    body: 'New customer message requires human response.',
    icon: '/favicon-48x48.png',
    badge: '/favicon-32x32.png',
    data: {
      url: '/admin',
      conversationId: null,
    },
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon-48x48.png',
    badge: data.badge || '/favicon-32x32.png',
    vibrate: [200, 100, 200, 100, 400],
    tag: data.data?.conversationId ? `support-conv-${data.data.conversationId}` : 'support-notification',
    renotify: true,
    requireInteraction: true,
    data: data.data || { url: '/admin' },
    actions: [
      {
        action: 'open',
        title: '💬 Open Support',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification click: Open Support Admin directly to the specific conversation
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/admin';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new tab/window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
