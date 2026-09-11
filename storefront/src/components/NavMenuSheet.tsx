import { Award, ListOrdered, LogIn, Phone, ShoppingCart, User, UtensilsCrossed } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { getInitials } from "@/lib/text"
import { useCustomerAuth } from "@/hooks/useCustomerAuth"
import type { Tenant } from "@/types"

interface NavMenuSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenant: Tenant
  onOpenCart: () => void
  onOpenLoyalty: () => void
  onOpenAccount: () => void
  onOpenOrders: () => void
}

export function NavMenuSheet({
  open,
  onOpenChange,
  tenant,
  onOpenCart,
  onOpenLoyalty,
  onOpenAccount,
  onOpenOrders,
}: NavMenuSheetProps) {
  const { isAuthenticated } = useCustomerAuth()
  const close = () => onOpenChange(false)

  const itemClass =
    "flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-100 transition-colors hover:bg-white/10"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="flex w-full flex-col border-none bg-neutral-950 text-neutral-100 sm:max-w-xs"
      >
        <SheetHeader className="flex-row items-center gap-2.5 border-b border-white/10 px-4 py-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary text-xs font-bold text-primary-foreground">
            {getInitials(tenant.name)}
          </span>
          <SheetTitle className="text-sm font-semibold text-white">{tenant.name}</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-1 flex-col py-1">
          <button type="button" onClick={close} className={itemClass}>
            <UtensilsCrossed className="size-4.5" strokeWidth={1.75} />
            Cardápio
          </button>

          <button
            type="button"
            onClick={() => {
              close()
              onOpenCart()
            }}
            className={itemClass}
          >
            <ShoppingCart className="size-4.5" strokeWidth={1.75} />
            Meu carrinho
          </button>

          <button
            type="button"
            onClick={() => {
              close()
              onOpenLoyalty()
            }}
            className={itemClass}
          >
            <Award className="size-4.5" strokeWidth={1.75} />
            Programa de fidelidade
          </button>

          <Separator className="my-1 bg-white/10" />

          <button
            type="button"
            onClick={() => {
              close()
              onOpenAccount()
            }}
            className={itemClass}
          >
            {isAuthenticated ? (
              <User className="size-4.5" strokeWidth={1.75} />
            ) : (
              <LogIn className="size-4.5" strokeWidth={1.75} />
            )}
            {isAuthenticated ? "Minha conta" : "Entrar / Criar conta"}
          </button>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                close()
                onOpenOrders()
              }}
              className={itemClass}
            >
              <ListOrdered className="size-4.5" strokeWidth={1.75} />
              Meus pedidos
            </button>
          )}

          {tenant.phone && (
            <>
              <Separator className="my-1 bg-white/10" />
              <a href={`tel:${tenant.phone}`} className={itemClass}>
                <Phone className="size-4.5" strokeWidth={1.75} />
                {tenant.phone}
              </a>
            </>
          )}
        </nav>

        <div className="border-t border-white/10 px-4 py-2.5 text-center text-[11px] text-neutral-500">
          Alô Delivery
        </div>
      </SheetContent>
    </Sheet>
  )
}
