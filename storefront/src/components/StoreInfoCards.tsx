import { AtSign, Bike, CreditCard, MapPin, type LucideIcon } from "lucide-react"
import { formatCents } from "@/lib/money"
import { mapsUrl } from "@/lib/contact"
import type { Tenant } from "@/types"

interface InfoCard {
  key: string
  icon: LucideIcon
  title: string
  text: string
  href?: string
}

// Cartões pequenos só com dados reais da loja; o que não existe não aparece.
function buildCards(tenant: Tenant): InfoCard[] {
  const cards: InfoCard[] = [
    {
      key: "pagamento",
      icon: CreditCard,
      title: "Pagamento",
      text: tenant.pixKey ? "Pix ou na entrega" : "Na entrega",
    },
    {
      key: "entrega",
      icon: Bike,
      title: "Entrega",
      text: [
        tenant.deliveryFee > 0 ? `Taxa ${formatCents(tenant.deliveryFee)}` : "Entrega grátis",
        tenant.minimumOrderValue > 0 ? `mínimo ${formatCents(tenant.minimumOrderValue)}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    },
  ]

  const maps = mapsUrl(tenant.address)
  if (tenant.address && maps) {
    cards.push({ key: "endereco", icon: MapPin, title: "Endereço", text: tenant.address, href: maps })
  }

  if (tenant.instagramUrl) {
    cards.push({ key: "instagram", icon: AtSign, title: "Instagram", text: "Siga a loja", href: tenant.instagramUrl })
  }

  return cards
}

export function StoreInfoCards({ tenant }: { tenant: Tenant }) {
  const cards = buildCards(tenant)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4">
      <ul className="no-scrollbar -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
        {cards.map(({ key, icon: Icon, title, text, href }) => {
          const content = (
            <>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-accent-title">
                <Icon className="size-[18px]" strokeWidth={2} aria-hidden />
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent-title">{title}</span>
                <span className="line-clamp-2 text-sm font-medium text-on-dark">{text}</span>
              </span>
            </>
          )
          const className =
            "flex min-h-14 w-56 shrink-0 snap-start items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm lg:w-auto"

          return (
            <li key={key} className="contents">
              {href ? (
                <a href={href} target="_blank" rel="noreferrer" className={className}>
                  {content}
                </a>
              ) : (
                <div className={className}>{content}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
