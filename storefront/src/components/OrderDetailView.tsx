import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatCents } from "@/lib/money"
import { getOrderStatusLabel } from "@/lib/orderStatus"
import { formatOrderItemTitle } from "@/lib/orderItemDisplay"
import { cancelCustomerOrder } from "@/services/customer"
import type { CustomerOrder } from "@/types"

const PAYMENT_LABELS: Record<string, string> = {
  pix_manual: "Pix",
  na_entrega: "Na entrega",
}

const CANCELED_BY_LABELS: Record<string, string> = {
  customer: "você",
  store: "a loja",
}

interface OrderDetailViewProps {
  order: CustomerOrder
  slug: string
  onOrderUpdated: (order: CustomerOrder) => void
}

export function OrderDetailView({ order, slug, onOrderUpdated }: OrderDetailViewProps) {
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [reason, setReason] = useState("")
  const [isCanceling, setIsCanceling] = useState(false)

  const handleCancel = async () => {
    if (!reason.trim()) return

    setIsCanceling(true)
    try {
      const updated = await cancelCustomerOrder(slug, order.id, reason.trim())
      onOrderUpdated({ ...order, ...updated })
      toast.success("Pedido cancelado")
      setShowCancelForm(false)
      setReason("")
    } catch {
      // erro já tratado e exibido via toast no interceptor do axios
    } finally {
      setIsCanceling(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {new Date(order.createdAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
          {getOrderStatusLabel(order.status)}
        </span>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
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
              {item.note && <span className="text-muted-foreground"> · Obs: {item.note}</span>}
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
        <span>Pagamento: {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
        <span>Entrega: {order.address}</span>
      </div>

      {order.status === "cancelado" && order.canceledBy && (
        <div className="flex flex-col gap-1 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <span className="font-medium text-destructive">
            Cancelado por {CANCELED_BY_LABELS[order.canceledBy] ?? order.canceledBy}
          </span>
          {order.cancelReason && <span className="text-muted-foreground">Motivo: {order.cancelReason}</span>}
        </div>
      )}

      {order.status === "novo" &&
        (showCancelForm ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="cancelReason">Motivo do cancelamento</Label>
            <Textarea
              id="cancelReason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Conte pra loja por que está cancelando"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={isCanceling}
                onClick={() => {
                  setShowCancelForm(false)
                  setReason("")
                }}
              >
                Voltar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={isCanceling || !reason.trim()}
                onClick={handleCancel}
              >
                {isCanceling ? "Cancelando..." : "Confirmar cancelamento"}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full text-destructive" onClick={() => setShowCancelForm(true)}>
            Cancelar pedido
          </Button>
        ))}
    </div>
  )
}
