import { api } from "@/services/api"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

export function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window
}

export async function subscribeToOrderPush(slug: string, orderId: string) {
  if (!isPushSupported()) {
    throw new Error("Notificações push não são suportadas neste navegador")
  }

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY

  const permission = await Notification.requestPermission()
  if (permission !== "granted") {
    throw new Error("Permissão de notificação negada")
  }

  const registration = await navigator.serviceWorker.ready

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })
  }

  const json = subscription.toJSON()

  await api.post(`/store/${slug}/orders/${orderId}/push-subscription`, {
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    },
  })
}
