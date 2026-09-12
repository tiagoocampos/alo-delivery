import { AtSign, MapPin, Phone } from "lucide-react"
import { formatBusinessHoursList } from "@/lib/storeHours"
import type { Tenant } from "@/types"

interface StoreFooterProps {
  tenant: Tenant
}

export function StoreFooter({ tenant }: StoreFooterProps) {
  const hours = formatBusinessHoursList(tenant.businessHours)

  const hasContent =
    tenant.description || tenant.address || hours.length > 0 || tenant.instagramUrl || tenant.phone

  if (!hasContent) return null

  return (
    <footer className="flex flex-col gap-3 border-t border-border bg-card px-4 py-6 text-sm text-muted-foreground">
      {tenant.description && <p>{tenant.description}</p>}

      {tenant.address && (
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          <span>{tenant.address}</span>
        </div>
      )}

      {hours.length > 0 && (
        <div className="flex flex-col gap-0.5">
          {hours.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      )}

      {tenant.instagramUrl && (
        <a
          href={tenant.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-foreground hover:underline"
        >
          <AtSign className="size-4 shrink-0" strokeWidth={1.75} />
          Instagram
        </a>
      )}

      {tenant.phone && (
        <a href={`tel:${tenant.phone}`} className="flex items-center gap-2">
          <Phone className="size-4 shrink-0" strokeWidth={1.75} />
          {tenant.phone}
        </a>
      )}
    </footer>
  )
}
