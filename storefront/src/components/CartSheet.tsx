import { useEffect, useState } from "react"
import { Minus, Plus, Trash2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckoutForm, type CheckoutFormValues } from "@/components/CheckoutForm"
import { formatAddressLine } from "@/lib/address"
import { formatCents } from "@/lib/money"
import { useCart } from "@/hooks/useCart"
import { useCustomerAuth } from "@/hooks/useCustomerAuth"
import { createOrder } from "@/services/storefront"
import { listAddresses } from "@/services/customer"
import type { Order } from "@/types"

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: string
  deliveryFee: number
  onOrderCreated: (order: Order) => void
}

export function CartSheet({ open, onOpenChange, slug, deliveryFee, onOrderCreated }: CartSheetProps) {
  const { items, subtotal, updateQuantity, removeItem, clear } = useCart()
  const { customer, isAuthenticated } = useCustomerAuth()
  const [step, setStep] = useState<"cart" | "checkout">("cart")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [defaultAddressLine, setDefaultAddressLine] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!open || !isAuthenticated) return

    listAddresses(slug)
      .then((addresses) => {
        const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0]
        setDefaultAddressLine(defaultAddress ? formatAddressLine(defaultAddress) : undefined)
      })
      .catch(() => {})
  }, [open, isAuthenticated, slug])

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) setStep("cart")
    onOpenChange(nextOpen)
  }

  const handleCheckout = async (values: CheckoutFormValues) => {
    setIsSubmitting(true)
    try {
      const order = await createOrder(slug, {
        ...values,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          note: item.note,
        })),
      })
      clear()
      setStep("cart")
      onOpenChange(false)
      onOrderCreated(order)
    } catch {
      // erro já tratado e exibido via toast no interceptor do axios
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="flex w-full flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{step === "cart" ? "Seu pedido" : "Dados para entrega"}</SheetTitle>
        </SheetHeader>

        {step === "cart" ? (
          <>
            <div className="flex flex-1 flex-col gap-3 px-4">
              {items.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Seu carrinho está vazio.
                </p>
              ) : (
                items.map((item) => (
                  <div key={item.key} className="flex gap-3 rounded-xl border border-border p-3">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium">{item.productName}</span>
                      {item.variantName && (
                        <span className="text-xs text-muted-foreground">{item.variantName}</span>
                      )}
                      {item.note && <span className="text-xs text-muted-foreground">Obs: {item.note}</span>}
                      <span className="text-sm font-semibold text-primary">
                        {formatCents(item.unitPrice * item.quantity)}
                      </span>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeItem(item.key)}
                        aria-label="Remover item"
                      >
                        <Trash2 className="text-muted-foreground" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon-xs"
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          aria-label="Diminuir quantidade"
                        >
                          <Minus />
                        </Button>
                        <span className="w-4 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon-xs"
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          aria-label="Aumentar quantidade"
                        >
                          <Plus />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <SheetFooter className="gap-3">
                <Separator />
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatCents(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxa de entrega</span>
                    <span>{formatCents(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatCents(subtotal + deliveryFee)}</span>
                  </div>
                </div>
                <Button size="lg" className="w-full" onClick={() => setStep("checkout")}>
                  Continuar
                </Button>
              </SheetFooter>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-4 px-4 pb-4">
            <CheckoutForm
              onSubmit={handleCheckout}
              isSubmitting={isSubmitting}
              defaultValues={{
                customerName: customer?.name,
                customerPhone: customer?.phone,
                address: defaultAddressLine,
              }}
            />
            <Button variant="ghost" onClick={() => setStep("cart")} disabled={isSubmitting}>
              Voltar para o carrinho
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
