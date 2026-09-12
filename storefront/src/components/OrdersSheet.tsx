import { useEffect, useState } from "react"
import { PackageOpen } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { formatCents } from "@/lib/money"
import { getOrderStatusLabel } from "@/lib/orderStatus"
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

  useEffect(() => {
    if (!open) return

    setLoading(true)
    listCustomerOrders(slug)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, slug])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Meus pedidos</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-3 px-4 pb-4">
          {loading &&
            Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-24 w-full rounded-xl" />)}

          {!loading && orders.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <PackageOpen className="size-8" />
              <p className="text-sm">Você ainda não fez nenhum pedido nesta loja.</p>
            </div>
          )}

          {!loading &&
            orders.map((order) => (
              <div key={order.id} className="flex flex-col gap-2 rounded-xl border border-border p-3">
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
                      {item.quantity}x {item.product.name}
                      {item.variant && ` · ${item.variant.name}`}
                      {item.selectedFlavors && item.selectedFlavors.length > 0 && ` · ${item.selectedFlavors.join(", ")}`}
                      {item.crust && ` · Borda: ${item.crust.name}`}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between text-sm font-semibold text-foreground">
                  <span>Total</span>
                  <span>{formatCents(order.total)}</span>
                </div>
              </div>
            ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
