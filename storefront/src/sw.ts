import { precacheAndRoute } from "workbox-precaching"

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>
}

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener("push", (event: PushEvent) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Alô Delivery", {
      body: data.body ?? "Seu pedido foi atualizado.",
      icon: "/icon-192.png",
    })
  )
})

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close()
  event.waitUntil(self.clients.openWindow("/"))
})
