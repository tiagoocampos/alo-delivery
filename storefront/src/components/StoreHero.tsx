import { useState } from "react"
import { Check, MapPin, MessageCircle, UtensilsCrossed } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCents } from "@/lib/money"
import { mapsUrl, whatsappUrl } from "@/lib/contact"
import { formatBusinessHoursSummary } from "@/lib/storeHours"
import { getStoreBranding } from "@/lib/storeBranding"
import type { Tenant } from "@/types"

interface StoreHeroProps {
  tenant: Tenant
  // Cliente que já pediu aqui: só o botão de ver o cardápio, sem a apresentação.
  collapsed: boolean
  onViewMenu: () => void
}

const ACTION =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-base font-bold transition-transform active:scale-[0.98]"

const LONG_DESCRIPTION = 140

function headlineSize(name: string) {
  if (name.length > 22) return "text-[1.5rem] sm:text-4xl"
  if (name.length > 14) return "text-[1.75rem] sm:text-5xl"
  return "text-[2rem] sm:text-6xl"
}

// Só afirmações verdadeiras: cada selo vem de um dado real da loja.
function trustBadges(tenant: Tenant): string[] {
  const badges: string[] = []

  if (tenant.pixKey) badges.push("Aceitamos Pix")
  badges.push("Pagamento na entrega")
  badges.push(tenant.deliveryFee > 0 ? `Taxa de entrega ${formatCents(tenant.deliveryFee)}` : "Entrega grátis")
  if (tenant.minimumOrderValue > 0) badges.push(`Pedido mínimo ${formatCents(tenant.minimumOrderValue)}`)

  return badges
}

export function StoreHero({ tenant, collapsed, onViewMenu }: StoreHeroProps) {
  const [expanded, setExpanded] = useState(false)
  const { logoUrl, bannerUrl } = getStoreBranding(tenant)

  const whatsapp = whatsappUrl(tenant.phone)
  const maps = mapsUrl(tenant.address)
  const hoursSummary = formatBusinessHoursSummary(tenant.businessHours)
  const description = tenant.description?.trim()
  const isLongDescription = (description?.length ?? 0) > LONG_DESCRIPTION

  if (collapsed) {
    return (
      <section className="bg-brand-dark px-4 py-3 text-on-dark">
        <div className="mx-auto flex max-w-6xl">
          <button type="button" onClick={onViewMenu} className={cn(ACTION, "w-full bg-primary text-primary-foreground sm:w-auto")}>
            <UtensilsCrossed className="size-5" />
            Ver cardápio completo
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="relative isolate overflow-hidden bg-brand-dark text-on-dark">
      {bannerUrl ? (
        // O banner entra inteiro, na proporção dele, em qualquer largura de tela
        // (antes era fundo com object-cover e o hero alto cortava as laterais).
        <div className="relative mx-auto w-full max-w-6xl lg:px-4 lg:pt-4">
          <img
            src={bannerUrl}
            alt=""
            fetchPriority="high"
            className="block h-auto min-h-24 w-full bg-surface lg:rounded-3xl"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-brand-dark to-transparent lg:inset-x-4 lg:rounded-b-3xl" />
        </div>
      ) : logoUrl ? (
        <>
          <img
            src={logoUrl}
            alt=""
            aria-hidden
            className="absolute -right-16 -top-16 -z-20 size-80 scale-125 object-cover opacity-25 blur-2xl"
          />
          <div className="absolute inset-0 -z-10 bg-linear-to-b from-brand-dark/60 to-brand-dark" />
        </>
      ) : (
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-brand-dark via-brand-dark to-surface" />
      )}

      <div
        className={cn(
          "mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-6 sm:pb-8",
          bannerUrl ? "relative -mt-8 pt-0 sm:-mt-12" : "pt-7 sm:pt-10"
        )}
      >
        <h1 className={cn("font-heading", headlineSize(tenant.name))}>
          <span className="block text-white">Faça seu pedido</span>
          <span className="line-clamp-2 block break-words text-balance text-accent-title">na {tenant.name}</span>
        </h1>

        {description && (
          <div className="max-w-2xl">
            <p className={cn("text-[15px] leading-relaxed text-on-dark-muted", !expanded && "line-clamp-3")}>
              {description}
            </p>
            {isLongDescription && (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="mt-1 min-h-11 text-sm font-semibold text-accent-title underline-offset-2 hover:underline"
              >
                {expanded ? "Ler menos" : "Ler mais"}
              </button>
            )}
          </div>
        )}

        <ul className="flex flex-wrap gap-2">
          {trustBadges(tenant).map((badge) => (
            <li
              key={badge}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-on-dark"
            >
              <Check className="size-3.5 text-status-open" strokeWidth={3} aria-hidden />
              {badge}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={onViewMenu}
            className={cn(ACTION, "bg-primary text-primary-foreground sm:flex-[1.6]")}
          >
            <UtensilsCrossed className="size-5" />
            Ver cardápio completo
          </button>

          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className={cn(ACTION, "bg-whatsapp text-white sm:flex-1")}
            >
              <MessageCircle className="size-5" />
              Pedir no WhatsApp
            </a>
          )}

          {maps && (
            <a
              href={maps}
              target="_blank"
              rel="noreferrer"
              className={cn(ACTION, "border-2 border-white/30 text-on-dark hover:bg-white/10 sm:flex-1")}
            >
              <MapPin className="size-5" />
              Como chegar
            </a>
          )}
        </div>

        {hoursSummary && <p className="text-xs font-medium text-on-dark-muted">{hoursSummary}</p>}
      </div>
    </section>
  )
}
