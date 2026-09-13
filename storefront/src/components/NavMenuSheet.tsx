import { Award, Download, ListOrdered, LogIn, Phone, ShoppingCart, User, UtensilsCrossed } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { getInitials } from "@/lib/text"
import { useCustomerAuth } from "@/hooks/useCustomerAuth"
import { useInstallPrompt } from "@/hooks/useInstallPrompt"
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
  const { canInstall, promptInstall } = useInstallPrompt()
  const close = () => onOpenChange(false)
  const hasBanner = Boolean(tenant.bannerUrl)

  const itemClass =
    "flex items-center gap-3 px-4 py-2.5 text-sm text-brand-foreground/90 transition-colors hover:bg-brand-foreground/10"

  const avatar = tenant.logoUrl ? (
    <img
      src={tenant.logoUrl}
      alt=""
      className="size-8 shrink-0 rounded-full object-cover ring-2 ring-white/30"
    />
  ) : (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary text-xs font-bold text-primary-foreground">
      {getInitials(tenant.name)}
    </span>
  )

  const titleRow = (
    <SheetHeader
      className={
        hasBanner
          ? "flex-row items-center gap-2.5 px-4 py-3"
          : "flex-row items-center gap-2.5 border-b border-brand-foreground/10 px-4 py-3"
      }
    >
      {avatar}
      <SheetTitle
        className={hasBanner ? "text-sm font-semibold text-white" : "text-sm font-semibold text-brand-foreground"}
      >
        {tenant.name}
      </SheetTitle>
    </SheetHeader>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="flex w-full flex-col border-none bg-brand text-brand-foreground sm:max-w-xs"
      >
        {hasBanner ? (
          <div className="relative w-full border-b border-brand-foreground/10">
            <img src={tenant.bannerUrl!} alt="" className="h-28 w-full object-cover" />
            <div className="absolute inset-x-0 top-0 bg-linear-to-b from-black/60 to-transparent">{titleRow}</div>
          </div>
        ) : (
          titleRow
        )}

        <nav className="flex flex-1 flex-col py-1">
          <button type="button" onClick={close} className={itemClass}>
            <UtensilsCrossed className="size-4.5" strokeWidth={1.75} />
            Cardápio
          </button>

          {canInstall && (
            <button type="button" onClick={promptInstall} className={itemClass}>
              <Download className="size-4.5" strokeWidth={1.75} />
              Instalar app
            </button>
          )}

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

          <Separator className="my-1 bg-brand-foreground/10" />

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
              <Separator className="my-1 bg-brand-foreground/10" />
              <a href={`tel:${tenant.phone}`} className={itemClass}>
                <Phone className="size-4.5" strokeWidth={1.75} />
                {tenant.phone}
              </a>
            </>
          )}
        </nav>

        <div className="border-t border-brand-foreground/10 px-4 py-2.5 text-center text-[11px] text-brand-foreground/50">
          Alô Delivery
        </div>
      </SheetContent>
    </Sheet>
  )
}
