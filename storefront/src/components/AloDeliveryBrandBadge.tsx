import { cn } from "@/lib/utils"

const ALO_DELIVERY_LANDING_URL = import.meta.env.VITE_ALO_DELIVERY_LANDING_URL

interface AloDeliveryBrandBadgeProps {
  // "sm": crédito discreto de rodapé (plano completo — sem função comercial
  // aqui, é só assinatura). "lg": versão em destaque (plano básico — também
  // reforça a marca por trás da loja gratuita).
  size?: "sm" | "lg"
  className?: string
}

// Bloco "Desenvolvido por Alô Delivery" clicável, abrindo a landing page em
// nova aba. Usado tanto no rodapé do menu (completo) quanto em destaque perto
// do topo (básico) — um componente único pra não duplicar a lógica do link.
export function AloDeliveryBrandBadge({ size = "sm", className }: AloDeliveryBrandBadgeProps) {
  if (size === "lg") {
    return (
      <a
        href={ALO_DELIVERY_LANDING_URL}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "flex items-center gap-2.5 rounded-xl bg-brand-foreground/10 px-3 py-2.5 transition-colors hover:bg-brand-foreground/15",
          className
        )}
      >
        <img src="/brand/symbol.png" alt="" className="size-8 shrink-0" />
        <span className="flex flex-col leading-tight">
          <span className="text-[10px] text-brand-foreground/60">Desenvolvido por</span>
          <span className="text-sm font-bold text-brand-foreground">Alô Delivery</span>
        </span>
      </a>
    )
  }

  return (
    <a
      href={ALO_DELIVERY_LANDING_URL}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "flex items-center justify-center gap-1.5 text-[11px] text-brand-foreground/50 transition-colors hover:text-brand-foreground/70",
        className
      )}
    >
      <img src="/brand/symbol.png" alt="" className="size-3.5 shrink-0" />
      Desenvolvido por Alô Delivery
    </a>
  )
}
