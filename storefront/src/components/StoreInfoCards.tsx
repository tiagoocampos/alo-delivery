import { AtSign, Clock, MapPin } from "lucide-react"
import { InfoRow } from "@/components/shell/SheetParts"
import { mapsUrl } from "@/lib/contact"
import { formatBusinessHoursList, formatBusinessHoursSummary } from "@/lib/storeHours"
import type { Tenant } from "@/types"

interface InfoCard {
  key: string
  icon: typeof Clock
  title: string
  text: string
  href?: string
  full?: boolean
}

// Só o que os selos da abertura não dizem: horário, endereço e Instagram.
// Pagamento, entrega e pedido mínimo já estão nos selos. O que não existe não aparece.
function buildCards(tenant: Tenant): InfoCard[] {
  const cards: InfoCard[] = []

  const hours = formatBusinessHoursSummary(tenant.businessHours) ?? formatBusinessHoursList(tenant.businessHours).join("\n")
  if (hours) cards.push({ key: "horario", icon: Clock, title: "Horário", text: hours, full: true })

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

  if (cards.length === 0) return null

  // Grade sem rolagem lateral: 2 colunas no celular (1 se houver só um cartão);
  // o último cartão ímpar ocupa a largura toda.
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4">
      <ul
        className={
          cards.length === 1
            ? "grid grid-cols-1 gap-2.5"
            : "grid grid-cols-2 gap-2.5 max-sm:[&>li:last-child:nth-child(odd)]:col-span-2 sm:grid-cols-3"
        }
      >
        {cards.map(({ key, icon, title, text, href, full }) => (
          <li key={key} className="min-w-0">
            <InfoRow icon={icon} title={title} text={text} href={href} full={full} className="h-full whitespace-pre-line" />
          </li>
        ))}
      </ul>
    </div>
  )
}
