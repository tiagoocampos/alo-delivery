import { Check } from "lucide-react"

// Maquete estática da tela "Personalizar item" — só para ilustrar o tutorial.
// Não é clicável e não mexe em carrinho nenhum.
export function BuildItemIllustration() {
  return (
    <div
      role="img"
      aria-label="Exemplo: os ingredientes Pão e Carne marcados, Tomate riscado (retirado) e o adicional Ovo por mais R$ 2,00."
      className="pointer-events-none flex select-none flex-col gap-2.5 rounded-2xl bg-brand-dark p-3 text-on-dark"
    >
      <div aria-hidden className="flex flex-col gap-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-widest">Ingredientes</span>
        <div className="flex flex-wrap gap-1.5">
          {["Pão", "Carne"].map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded-full border border-accent-title bg-white/10 px-2.5 py-1 text-xs font-semibold"
            >
              <Check className="size-3 text-accent-title" strokeWidth={3} />
              {name}
            </span>
          ))}
          <span className="inline-flex items-center rounded-full border border-white/15 px-2.5 py-1 text-xs font-semibold text-on-dark-muted line-through">
            Tomate
          </span>
        </div>
      </div>

      <div aria-hidden className="flex flex-col gap-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-widest">Adicionais</span>
        <div className="flex items-center gap-2 rounded-xl border border-accent-title bg-white/10 px-2.5 py-2 text-xs font-semibold">
          <span className="flex size-4 items-center justify-center rounded bg-accent-title text-brand-dark">
            <Check className="size-3" strokeWidth={3.5} />
          </span>
          <span className="flex-1">Ovo</span>
          <span className="font-bold tabular-nums text-accent-title">+R$ 2,00</span>
        </div>
      </div>
    </div>
  )
}
