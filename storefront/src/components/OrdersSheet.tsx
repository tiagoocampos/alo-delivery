import { useEffect, useState } from "react"
import { PackageOpen } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { OrderDetailView } from "@/components/OrderDetailView"
import { formatCents } from "@/lib/money"
import { getOrderStatusLabel } from "@/lib/orderStatus"
import { formatOrderItemTitle } from "@/lib/orderItemDisplay"
import { listCustomerOrders } from "@/services/customer"
import type { CustomerOrder } from "@/types"

interface OrdersSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: string
}

export function OrdersSheet({ open, onOpenChange, slug }: OrdersSheetProps) {
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null)

  useEffect(() => {
    if (!open) return

    setLoading(true)
    listCustomerOrders(slug)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, slug])

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) setSelectedOrder(null)
    onOpenChange(nextOpen)
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="flex w-full flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{selectedOrder ? "Detalhe do pedido" : "Meus pedidos"}</SheetTitle>
        </SheetHeader>

        {selectedOrder ? (
          <div className="flex flex-col gap-4 px-4 pb-4">
            <OrderDetailView
              order={selectedOrder}
              slug={slug}
              onOrderUpdated={(updated) => {
                setOrders((current) => current.map((o) => (o.id === updated.id ? updated : o)))
                setSelectedOrder(updated)
              }}
            />
            <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
              Voltar para meus pedidos
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-4 pb-4">
            {loading &&
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-xl" />
              ))}

            {!loading && orders.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                <PackageOpen className="size-8" />
                <p className="text-sm">Você ainda não fez nenhum pedido nesta loja.</p>
              </div>
            )}

            {!loading &&
              orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedOrder(order)}
                  className="flex flex-col gap-2 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
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

                  <div className="flex flex-col gap-0.5">
                    {order.items.map((item) => (
                      <span key={item.id} className="text-xs text-muted-foreground">
                        {item.quantity}x {formatOrderItemTitle(item)}
                        {item.variant && ` · ${item.variant.name}`}
                        {item.extras.length > 0 && ` · ${item.extras.map((e) => e.name).join(", ")}`}
                        {item.flavors.length > 0 && ` · ${item.flavors.map((f) => f.productName).join(", ")}`}
                        {item.categoryCrust && ` · Borda: ${item.categoryCrust.name}`}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between text-sm font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatCents(order.total)}</span>
                  </div>
                </button>
              ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
