import { Menu, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { formatCents } from "@/lib/money"
import type { Tenant } from "@/types"

interface StoreHeaderProps {
  tenant: Tenant
  cartCount: number
  onOpenMenu: () => void
  onOpenCart: () => void
}

export function StoreHeader({ tenant, cartCount, onOpenMenu, onOpenCart }: StoreHeaderProps) {
  return (
    <header className="sticky top-0 z-40">
      <div className="flex items-center justify-between gap-2 bg-brand px-2 py-2.5 text-brand-foreground">
        <Button variant="ghost" size="icon" onClick={onOpenMenu} aria-label="Abrir menu" className="text-brand-foreground hover:bg-brand-foreground/10 hover:text-brand-foreground">
          <Menu />
        </Button>

        <span className="truncate font-heading text-sm font-semibold uppercase tracking-wide">{tenant.name}</span>

        <div className="flex items-center gap-0.5">
          <ThemeToggle className="text-brand-foreground hover:bg-brand-foreground/10 hover:text-brand-foreground" />
          <Button
            variant="ghost"
            size="icon"
            className="relative text-white hover:bg-white/10 hover:text-white"
            onClick={onOpenCart}
            aria-label="Abrir carrinho"
          >
            <ShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
        {tenant.phone && <span>{tenant.phone}</span>}
        <span>Taxa de entrega: {formatCents(tenant.deliveryFee)}</span>
      </div>
    </header>
  )
}
