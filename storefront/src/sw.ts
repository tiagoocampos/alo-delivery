/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event) => {
    if (!event.data) return;

    const data = event.data.json();

    event.waitUntil(
        self.registration.showNotification(data.title ?? "Alô Delivery", {
            body: data.body,
            icon: "/pwa-192x192.png",
            badge: "/pwa-192x192.png",
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    event.waitUntil(
        self.clients.matchAll({ type: "window" }).then((clientList) => {
            for (const client of clientList) {
                if ("focus" in client) return client.focus();
            }

            if (self.clients.openWindow) {
                return self.clients.openWindow("/");
            }
        })
    );
});
