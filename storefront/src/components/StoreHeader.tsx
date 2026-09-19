import { Menu, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ThemeToggle"
import { StoreBrandLogo } from "@/components/StoreBrandLogo"
import { formatCents } from "@/lib/money"
import { getStoreOpenStatus } from "@/lib/storeHours"
import { getStoreBranding } from "@/lib/storeBranding"
import type { Tenant } from "@/types"

interface StoreHeaderProps {
  tenant: Tenant
  cartCount: number
  onOpenMenu: () => void
  onOpenCart: () => void
}

export function StoreHeader({ tenant, cartCount, onOpenMenu, onOpenCart }: StoreHeaderProps) {
  const { isBasico, logoUrl, bannerUrl } = getStoreBranding(tenant)
  const hasBanner = Boolean(bannerUrl)

  const iconBar = (
    <div
      className={
        hasBanner
          ? "flex items-center justify-between gap-2 bg-linear-to-b from-black/60 to-transparent px-2 py-2.5 text-white"
          : "flex items-center justify-between gap-2 bg-brand px-2 py-2.5 text-brand-foreground"
      }
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenMenu}
        aria-label="Abrir menu"
        className={
          hasBanner
            ? "text-white hover:bg-white/10 hover:text-white"
            : "text-brand-foreground hover:bg-brand-foreground/10 hover:text-brand-foreground"
        }
      >
        <Menu />
      </Button>

      <div className="flex min-w-0 items-center gap-2">
        {isBasico ? (
          <StoreBrandLogo className="size-9 shrink-0 rounded-full object-cover" />
        ) : (
          logoUrl && <img src={logoUrl} alt="" className="size-7 shrink-0 rounded-full object-cover" />
        )}
        <span className="truncate font-heading text-sm font-semibold uppercase tracking-wide">{tenant.name}</span>
      </div>

      <div className="flex items-center gap-0.5">
        <ThemeToggle
          className={
            hasBanner
              ? "text-white hover:bg-white/10 hover:text-white"
              : "text-brand-foreground hover:bg-brand-foreground/10 hover:text-brand-foreground"
          }
        />
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:bg-white/10 hover:text-white"
          onClick={onOpenCart}
          aria-label="Abrir carrinho"
        >
          <ShoppingCart />
          {cartCount > 0 && (
            <span
              key={cartCount}
              className="absolute -right-1 -top-1 flex size-4 animate-in items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground zoom-in-50 duration-200"
            >
              {cartCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  )

  const openStatus = getStoreOpenStatus(tenant.businessHours)

  const deliveryBar = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
      {openStatus && (
        <span className="flex items-center gap-1.5">
          <Badge
            variant={openStatus.isOpen ? "default" : "secondary"}
            className={openStatus.isOpen ? "bg-emerald-600 text-white" : undefined}
          >
            {openStatus.isOpen ? "Aberto agora" : "Fechado"}
          </Badge>
          {openStatus.label && <span>{openStatus.label}</span>}
        </span>
      )}
      {tenant.phone && <span>{tenant.phone}</span>}
      <span>Taxa de entrega: {formatCents(tenant.deliveryFee)}</span>
      {tenant.minimumOrderValue > 0 && (
        <span>Pedido mínimo: {formatCents(tenant.minimumOrderValue)}</span>
      )}
    </div>
  )

  if (hasBanner) {
    return (
      <header>
        <div className="relative w-full">
          <img
            src={bannerUrl!}
            alt=""
            className="h-48 w-full object-cover sm:h-56"
          />
          <div className="absolute inset-x-0 top-0">{iconBar}</div>
        </div>
        {deliveryBar}
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40">
      {iconBar}
      {deliveryBar}
    </header>
  )
}
