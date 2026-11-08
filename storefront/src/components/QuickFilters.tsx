import { cn } from "@/lib/utils"
import type { QuickFilter, QuickFilterOption } from "@/lib/menuFilters"

interface QuickFiltersProps {
  options: QuickFilterOption[]
  active: QuickFilter
  onChange: (filter: QuickFilter) => void
}

export function QuickFilters({ options, active, onChange }: QuickFiltersProps) {
  // Só "Todos": não há o que filtrar.
  if (options.length <= 1) return null

  return (
    <div role="group" aria-label="Filtros rápidos" className="no-scrollbar mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-4 pb-1 pt-3">
      {options.map((option) => {
        const selected = active === option.id

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-full border px-3.5 text-xs font-bold whitespace-nowrap transition-colors",
              selected
                ? "border-accent-heading bg-accent text-accent-foreground"
                : "border-border bg-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
