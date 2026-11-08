import { useState } from "react"
import { Check, MapPin, MessageCircle, UtensilsCrossed } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCents } from "@/lib/money"
import { mapsUrl, whatsappUrl } from "@/lib/contact"
import { getStoreBranding } from "@/lib/storeBranding"
import type { BannerInfo } from "@/lib/bannerInfo"
import type { Tenant } from "@/types"

interface StoreHeroProps {
  tenant: Tenant
  // Cliente que já pediu aqui: só o botão de ver o cardápio, sem a apresentação.
  collapsed: boolean
  // Proporção e cores de borda do banner (já lidas antes de desenhar a página).
  banner: BannerInfo
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

const NATURAL_MIN = 1.6
const NATURAL_MAX = 3.5
const MAX_HEIGHT = "max-h-[220px] sm:max-h-[320px]"

// Capa de ponta a ponta, sem caixa nem moldura. O fundo do bloco tem a cor das
// bordas da imagem (amostrada), então não há emenda nem faixa vazia; as pontas
// de cima e de baixo se dissolvem no cabeçalho e no conteúdo.
function BannerCover({ src, alt, banner }: { src: string; alt: string; banner: BannerInfo }) {
  const { ratio, top, bottom } = banner
  // Proporção natural quando é razoável; fora disso 2:1 recortando (nunca "contain").
  const natural = ratio !== null && ratio >= NATURAL_MIN && ratio <= NATURAL_MAX

  return (
    <div
      className="relative"
      style={{ background: `linear-gradient(to bottom, ${top ?? "var(--brand-dark)"}, ${bottom ?? "var(--brand-dark)"})` }}
    >
      <div className="mx-auto w-full max-w-[960px]">
        <img
          src={src}
          alt={alt}
          fetchPriority="high"
          decoding="async"
          width={1200}
          height={Math.round(1200 / (natural ? ratio! : 2))}
          style={{ aspectRatio: natural ? ratio! : 2 }}
          className={cn("block h-auto w-full object-cover object-center", MAX_HEIGHT)}
        />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-linear-to-b from-brand-dark to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-b from-transparent to-brand-dark" />
    </div>
  )
}

// Sem banner (ou plano básico): o mesmo bloco de ponta a ponta, com o degradê
// da marca e, se a loja puder usar logo, ela centralizada.
function PlainCover({ logoUrl }: { logoUrl: string | null }) {
  return (
    <div
      className={cn(
        "relative isolate flex items-center justify-center overflow-hidden bg-linear-to-br from-brand-dark via-brand-dark to-surface",
        logoUrl ? "h-40 sm:h-52" : "h-24 sm:h-32"
      )}
    >
      {logoUrl && (
        <>
          <img
            src={logoUrl}
            alt=""
            aria-hidden
            className="absolute -right-16 -top-16 -z-10 size-80 scale-125 object-cover opacity-25 blur-2xl"
          />
          <img
            src={logoUrl}
            alt=""
            width={112}
            height={112}
            fetchPriority="high"
            className="size-24 rounded-full object-cover shadow-lg ring-4 ring-white/15 sm:size-28"
          />
        </>
      )}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-b from-transparent to-brand-dark" />
    </div>
  )
}

export function StoreHero({ tenant, collapsed, banner, onViewMenu }: StoreHeroProps) {
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
    <section className="relative isolate overflow-hidden rounded-b-[28px] bg-brand-dark text-on-dark dark:rounded-b-none">
      {bannerUrl ? (
        <BannerCover src={bannerUrl} alt={`Banner da ${tenant.name}`} banner={banner} />
      ) : (
        <PlainCover logoUrl={logoUrl} />
      )}

      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 pb-7 pt-2 sm:gap-4 sm:pb-9 sm:pt-4">
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
