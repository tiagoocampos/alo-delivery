import { Award, CircleHelp, Download, Heart, ListOrdered, LogIn, Phone, ShoppingCart, User, UtensilsCrossed } from "lucide-react"
import { SheetTitle } from "@/components/ui/sheet"
import { SheetShell } from "@/components/shell/SheetShell"
import { MenuRow, SheetGroup, SheetSectionTitle } from "@/components/shell/SheetParts"
import { StoreBrandLogo } from "@/components/StoreBrandLogo"
import { AloDeliveryBrandBadge } from "@/components/AloDeliveryBrandBadge"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/text"
import { getStoreBranding } from "@/lib/storeBranding"
import { formatOpenStatus, getStoreOpenStatus } from "@/lib/storeHours"
import { telUrl } from "@/lib/contact"
import { useCart } from "@/hooks/useCart"
import { useCustomerAuth } from "@/hooks/useCustomerAuth"
import { useInstallPrompt } from "@/hooks/useInstallPrompt"
import { useCustomerTour } from "@/tour/useCustomerTour"
import type { Tenant } from "@/types"

interface NavMenuSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenant: Tenant
  // Favoritos que ainda existem no cardápio (o contador do menu).
  favoritesCount: number
  onOpenCart: () => void
  onOpenLoyalty: () => void
  onOpenAccount: () => void
  onOpenOrders: () => void
  onOpenFavorites: () => void
}

export function NavMenuSheet({
  open,
  onOpenChange,
  tenant,
  favoritesCount,
  onOpenCart,
  onOpenLoyalty,
  onOpenAccount,
  onOpenOrders,
  onOpenFavorites,
}: NavMenuSheetProps) {
  const { isAuthenticated } = useCustomerAuth()
  const { canInstall, promptInstall } = useInstallPrompt()
  const { totalCount } = useCart()
  const { startTour } = useCustomerTour()
  const { isBasico, logoUrl } = getStoreBranding(tenant)
  const openStatus = getStoreOpenStatus(tenant.businessHours)
  const tel = telUrl(tenant.phone)

  const close = () => onOpenChange(false)
  // Fecha o menu e então abre a outra tela (ou inicia o tutorial).
  const go = (action: () => void) => () => {
    close()
    action()
  }

  const avatarClass = "size-11 shrink-0 rounded-full object-cover ring-2 ring-white/15"
  const avatar = isBasico ? (
    <StoreBrandLogo className={avatarClass} />
  ) : logoUrl ? (
    <img src={logoUrl} alt="" width={44} height={44} className={avatarClass} />
  ) : (
    <span
      aria-hidden
      className={cn("flex items-center justify-center bg-primary text-sm font-bold text-primary-foreground", avatarClass)}
    >
      {getInitials(tenant.name)}
    </span>
  )

  // Identidade compacta: logo, nome (até 2 linhas) e se está aberto. Sem banner.
  const header = (
    <div className="flex min-w-0 items-center gap-3">
      {avatar}
      <div className="flex min-w-0 flex-col leading-tight">
        <SheetTitle className="font-heading line-clamp-2 break-words text-base text-accent-title [--heading-weight:700]">
          {tenant.name}
        </SheetTitle>
        {openStatus && (
          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-on-dark-muted">
            <span
              aria-hidden
              className={cn("size-2 shrink-0 rounded-full", openStatus.isOpen ? "bg-status-open" : "bg-status-closed")}
            />
            <span className="truncate">{formatOpenStatus(openStatus)}</span>
          </span>
        )}
      </div>
    </div>
  )

  return (
    <SheetShell
      open={open}
      onOpenChange={onOpenChange}
      side="left"
      title={tenant.name}
      header={header}
      bodyClassName="gap-4 pb-4"
      footerClassName="border-white/10 bg-brand-dark"
      footer={<AloDeliveryBrandBadge size={isBasico ? "lg" : "sm"} className={isBasico ? undefined : "py-1"} />}
    >
      <nav aria-label="Menu da loja" className="flex flex-col gap-4">
        <section aria-labelledby="menu-loja" className="flex flex-col">
          <SheetSectionTitle>
            <span id="menu-loja">Loja</span>
          </SheetSectionTitle>
          <SheetGroup>
            <MenuRow icon={UtensilsCrossed} label="Cardápio" onClick={close} />
            <MenuRow icon={ShoppingCart} label="Meu carrinho" count={totalCount} onClick={go(onOpenCart)} />
            {canInstall && !isBasico && <MenuRow icon={Download} label="Instalar app" onClick={() => void promptInstall()} />}
            <MenuRow
              icon={CircleHelp}
              label="Como pedir?"
              // Espera o menu terminar de fechar antes de abrir o tour.
              onClick={() => {
                close()
                window.setTimeout(startTour, 350)
              }}
            />
            <MenuRow icon={Award} label="Programa de fidelidade" onClick={go(onOpenLoyalty)} />
            {tel && tenant.phone && <MenuRow icon={Phone} label={tenant.phone} href={tel} chevron={false} />}
          </SheetGroup>
        </section>

        <section aria-labelledby="menu-conta" className="flex flex-col">
          <SheetSectionTitle>
            <span id="menu-conta">Minha conta</span>
          </SheetSectionTitle>
          <SheetGroup>
            <MenuRow
              icon={isAuthenticated ? User : LogIn}
              label={isAuthenticated ? "Minha conta" : "Entrar / Criar conta"}
              onClick={go(onOpenAccount)}
            />
            {isAuthenticated && <MenuRow icon={ListOrdered} label="Meus pedidos" onClick={go(onOpenOrders)} />}
            <MenuRow icon={Heart} label="Meus favoritos" count={favoritesCount} onClick={go(onOpenFavorites)} />
          </SheetGroup>
        </section>
      </nav>
    </SheetShell>
  )
}
