import { useState } from "react"
import { Bell, BellRing, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCents } from "@/lib/money"
import { formatOrderItemTitle } from "@/lib/orderItemDisplay"
import { isPushSupported, subscribeToOrderPush } from "@/lib/pushSubscription"
import type { Order } from "@/types"

const PAYMENT_LABELS: Record<Order["paymentMethod"], string> = {
  pix_manual: "Pix",
  na_entrega: "Na entrega",
}

interface OrderConfirmationProps {
  order: Order
  slug: string
  onNewOrder: () => void
}

export function OrderConfirmation({ order, slug, onNewOrder }: OrderConfirmationProps) {
  const [pushState, setPushState] = useState<"idle" | "loading" | "subscribed">("idle")

  async function handleSubscribe() {
    setPushState("loading")

    try {
      await subscribeToOrderPush(slug, order.id)
      setPushState("subscribed")
    } catch {
      setPushState("idle")
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 p-3">
      <div className="flex flex-col items-center gap-1.5 pt-4 text-center">
        <CheckCircle2 className="size-9 text-primary" />
        <h1 className="font-heading text-lg font-semibold text-foreground">Pedido enviado!</h1>
        <p className="text-sm text-muted-foreground">
          A loja já recebeu seu pedido e vai confirmar em instantes.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border p-3">
        <div className="flex flex-col gap-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {formatOrderItemTitle(item)}
                {item.variant && <span className="text-muted-foreground"> · {item.variant.name}</span>}
                {item.flavors.length > 0 && (
                  <span className="text-muted-foreground"> · {item.flavors.map((f) => f.productName).join(", ")}</span>
                )}
                {item.categoryCrust && (
                  <span className="text-muted-foreground"> · Borda: {item.categoryCrust.name}</span>
                )}
              </span>
              <span className="text-muted-foreground">{formatCents(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCents(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Taxa de entrega</span>
            <span>{formatCents(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-semibold text-foreground">
            <span>Total</span>
            <span>{formatCents(order.total)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <span>Pagamento: {PAYMENT_LABELS[order.paymentMethod]}</span>
          <span>Entrega: {order.address}</span>
        </div>
      </div>

      {isPushSupported() && (
        <Button
          onClick={handleSubscribe}
          disabled={pushState !== "idle"}
          variant="secondary"
          size="lg"
          className="w-full"
        >
          {pushState === "subscribed" ? (
            <>
              <BellRing className="size-4" />
              Você vai ser avisado por notificação
            </>
          ) : (
            <>
              <Bell className="size-4" />
              {pushState === "loading" ? "Ativando..." : "Avisar quando o pedido atualizar"}
            </>
          )}
        </Button>
      )}

      <Button onClick={onNewOrder} variant="outline" size="lg" className="w-full">
        Fazer novo pedido
      </Button>
    </div>
  )
}
