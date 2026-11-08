import { AtSign, Clock, MapPin, Phone } from "lucide-react"
import { AloDeliveryBrandBadge } from "@/components/AloDeliveryBrandBadge"
import { mapsUrl, telUrl } from "@/lib/contact"
import { formatBusinessHoursList } from "@/lib/storeHours"
import type { Tenant } from "@/types"

interface StoreFooterProps {
  tenant: Tenant
}

const LINK = "flex items-start gap-2.5 text-sm text-on-dark transition-colors hover:text-accent-title"

export function StoreFooter({ tenant }: StoreFooterProps) {
  const hours = formatBusinessHoursList(tenant.businessHours)
  const maps = mapsUrl(tenant.address)
  const tel = telUrl(tenant.phone)

  return (
    <footer className="mt-12 bg-brand-dark text-on-dark">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="font-heading break-words text-2xl text-accent-title">{tenant.name}</span>
          {tenant.description && (
            <p className="line-clamp-4 max-w-md text-sm leading-relaxed text-on-dark-muted">{tenant.description}</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {tenant.address &&
            (maps ? (
              <a href={maps} target="_blank" rel="noreferrer" className={LINK}>
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent-title" aria-hidden />
                <span>{tenant.address}</span>
              </a>
            ) : (
              <div className={LINK}>
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent-title" aria-hidden />
                <span>{tenant.address}</span>
              </div>
            ))}

          {tenant.phone && (
            <a href={tel ?? undefined} className={LINK}>
              <Phone className="mt-0.5 size-4 shrink-0 text-accent-title" aria-hidden />
              <span>{tenant.phone}</span>
            </a>
          )}

          {tenant.instagramUrl && (
            <a href={tenant.instagramUrl} target="_blank" rel="noreferrer" className={LINK}>
              <AtSign className="mt-0.5 size-4 shrink-0 text-accent-title" aria-hidden />
              <span>Instagram</span>
            </a>
          )}

          {hours.length > 0 && (
            <div className="flex items-start gap-2.5 text-sm text-on-dark-muted">
              <Clock className="mt-0.5 size-4 shrink-0 text-accent-title" aria-hidden />
              <ul className="flex flex-col gap-0.5">
                {hours.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <AloDeliveryBrandBadge size="sm" className="border-t border-white/10 px-4 py-3" />
      <div className="pb-[calc(5rem+env(safe-area-inset-bottom))]" aria-hidden />
    </footer>
  )
}
