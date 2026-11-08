import { Menu, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { StoreBrandLogo } from "@/components/StoreBrandLogo"
import { cn } from "@/lib/utils"
import { formatOpenStatus, getStoreOpenStatus } from "@/lib/storeHours"
import { getStoreBranding } from "@/lib/storeBranding"
import type { Tenant } from "@/types"

interface StoreHeaderProps {
  tenant: Tenant
  cartCount: number
  onOpenMenu: () => void
  onOpenCart: () => void
}

const ICON_BUTTON = "size-11 text-on-dark hover:bg-white/10 hover:text-on-dark"

export function StoreHeader({ tenant, cartCount, onOpenMenu, onOpenCart }: StoreHeaderProps) {
  const { isBasico, logoUrl } = getStoreBranding(tenant)
  const openStatus = getStoreOpenStatus(tenant.businessHours)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-dark text-on-dark">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-1.5 px-2">
        <Button variant="ghost" size="icon" onClick={onOpenMenu} aria-label="Abrir menu" className={ICON_BUTTON}>
          <Menu />
        </Button>

        {isBasico ? (
          <StoreBrandLogo className="size-9 shrink-0 rounded-full object-cover" />
        ) : (
          logoUrl && (
            <img
              src={logoUrl}
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-full object-cover ring-2 ring-white/15"
            />
          )
        )}

        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="font-heading truncate text-sm [--heading-weight:700] min-[400px]:text-base text-accent-title">{tenant.name}</span>
          {openStatus && (
            <span className="flex items-center gap-1.5 text-xs text-on-dark-muted">
              <span
                aria-hidden
                className={cn("size-2 shrink-0 rounded-full", openStatus.isOpen ? "bg-status-open" : "bg-status-closed")}
              />
              <span className="truncate">{formatOpenStatus(openStatus)}</span>
            </span>
          )}
        </div>

        <ThemeToggle className={ICON_BUTTON} />

        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", ICON_BUTTON)}
          onClick={onOpenCart}
          aria-label={cartCount > 0 ? `Abrir carrinho, ${cartCount} ${cartCount === 1 ? "item" : "itens"}` : "Abrir carrinho"}
        >
          <ShoppingCart />
          {cartCount > 0 && (
            <span
              key={cartCount}
              className="absolute right-0.5 top-0.5 flex min-w-5 animate-in items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-5 text-primary-foreground zoom-in-50 duration-200"
            >
              {cartCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  )
}
