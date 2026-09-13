import { api } from "@/services/api"

export function supportsPush(): boolean {
  return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window
}

// Conversão padrão de VAPID public key (base64url) pra Uint8Array — trecho
// amplamente documentado em tutoriais de Web Push, não é algo pra inventar.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray as Uint8Array<ArrayBuffer>
}

// Retorna true se a inscrição foi criada, false se o cliente negou a permissão.
export async function subscribeToOrderPush(slug: string, orderId: string): Promise<boolean> {
  const permission = await Notification.requestPermission()
  if (permission !== "granted") return false

  const registration = await navigator.serviceWorker.ready

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY as string),
  })

  await api.post(`/store/${slug}/orders/${orderId}/push-subscription`, subscription.toJSON())
  return true
}
