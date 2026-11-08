import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

// Linha do tempo estática do pedido (nomes reais de lib/orderStatus).
export function TrackingIllustration({ stages }: { stages: string[] }) {
  return (
    <ol
      aria-label={`Etapas do pedido: ${stages.join(", ")}.`}
      className="pointer-events-none flex select-none items-start gap-1 rounded-2xl bg-brand-dark p-3 text-on-dark"
    >
      {stages.map((stage, i) => (
        <li key={stage} className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
          <span className="flex w-full items-center">
            <span aria-hidden className={cn("h-0.5 flex-1", i === 0 ? "bg-transparent" : "bg-white/20")} />
            <span
              aria-hidden
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                i === 0 ? "bg-accent-title text-brand-dark" : "border border-white/25 text-on-dark-muted"
              )}
            >
              {i === 0 ? <Check className="size-3.5" strokeWidth={3.5} /> : i + 1}
            </span>
            <span aria-hidden className={cn("h-0.5 flex-1", i === stages.length - 1 ? "bg-transparent" : "bg-white/20")} />
          </span>
          <span className={cn("text-[11px] font-semibold leading-tight", i === 0 ? "text-on-dark" : "text-on-dark-muted")}>
            {stage}
          </span>
        </li>
      ))}
    </ol>
  )
}
