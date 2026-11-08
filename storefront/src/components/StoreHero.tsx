import { useState } from "react"
import { Check, MapPin, MessageCircle, UtensilsCrossed } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCents } from "@/lib/money"
import { mapsUrl, whatsappUrl } from "@/lib/contact"
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

// Só afirmações verdadeiras: cada selo vem de um dado real da loja.
function trustBadges(tenant: Tenant): string[] {
  const badges: string[] = []

  if (tenant.pixKey) badges.push("Aceitamos Pix")
  badges.push("Pagamento na entrega")
  badges.push(tenant.deliveryFee > 0 ? `Taxa de entrega ${formatCents(tenant.deliveryFee)}` : "Entrega grátis")
  if (tenant.minimumOrderValue > 0) badges.push(`Pedido mínimo ${formatCents(tenant.minimumOrderValue)}`)

  return badges
}

// O banner é um bloco próprio, na proporção 2:1. Imagem quase 2:1 (±8%) preenche
// o bloco; muito diferente aparece inteira (sem cortar o texto que ela tenha).
function BannerBlock({ src }: { src: string }) {
  const [fit, setFit] = useState<"cover" | "contain">("cover")

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4">
      <div className="aspect-2/1 overflow-hidden rounded-3xl bg-surface ring-1 ring-white/10">
        <img
          src={src}
          alt=""
          fetchPriority="high"
          onLoad={(event) => {
            const { naturalWidth, naturalHeight } = event.currentTarget
            const ratio = naturalHeight > 0 ? naturalWidth / naturalHeight : 2
            setFit(ratio >= 1.85 && ratio <= 2.15 ? "cover" : "contain")
          }}
          className={cn("size-full", fit === "cover" ? "object-cover" : "object-contain")}
        />
      </div>
    </div>
  )
}

export function StoreHero({ tenant, collapsed, onViewMenu }: StoreHeroProps) {
  const [expanded, setExpanded] = useState(false)
  const { logoUrl, bannerUrl } = getStoreBranding(tenant)

  const whatsapp = whatsappUrl(tenant.phone)
  const maps = mapsUrl(tenant.address)
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
        <BannerBlock src={bannerUrl} />
      ) : logoUrl ? (
        // Sem banner: logo grande sobre o degradê do tema.
        <>
          <img
            src={logoUrl}
            alt=""
            aria-hidden
            className="absolute -right-16 -top-16 -z-20 size-80 scale-125 object-cover opacity-25 blur-2xl"
          />
          <div className="absolute inset-0 -z-10 bg-linear-to-b from-brand-dark/60 to-brand-dark" />
          <div className="flex justify-center pt-6">
            <img
              src={logoUrl}
              alt=""
              width={112}
              height={112}
              fetchPriority="high"
              className="size-28 rounded-full object-cover shadow-lg ring-4 ring-white/15"
            />
          </div>
        </>
      ) : (
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-brand-dark via-brand-dark to-surface" />
      )}

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-6 pt-5 sm:pb-8">
        {/* O nome da loja já está no cabeçalho: aqui só a chamada, abaixo do banner. */}
        <h1 className="font-heading text-[2rem] sm:text-5xl">
          <span className="block text-on-dark">Faça seu pedido</span>
          <span className="block text-accent-title">É rápido e fácil</span>
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
      </div>
    </section>
  )
}
