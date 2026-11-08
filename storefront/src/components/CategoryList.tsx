import { useEffect, useRef } from "react"
import { LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCategoryIcon } from "@/lib/categoryVisuals"
import type { Category } from "@/types"

interface CategoryListProps {
  categories: Category[]
  activeCategoryId: string | null
  onSelect: (categoryId: string | null) => void
}

const CHIP =
  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors"

// Faixa de categorias fixa logo abaixo do cabeçalho (56px).
export function CategoryList({ categories, activeCategoryId, onSelect }: CategoryListProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Mantém o chip ativo à vista sem rolar a página (só a faixa).
  useEffect(() => {
    const container = containerRef.current
    const chip = container?.querySelector<HTMLElement>("[aria-pressed='true']")
    if (!container || !chip) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    container.scrollTo({
      left: chip.offsetLeft - container.clientWidth / 2 + chip.clientWidth / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    })
  }, [activeCategoryId])

  return (
    <nav aria-label="Categorias" data-tour="categorias" className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div ref={containerRef} className="no-scrollbar mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2">
        <button
          type="button"
          aria-pressed={activeCategoryId === null}
          onClick={() => onSelect(null)}
          className={cn(
            CHIP,
            activeCategoryId === null
              ? "border-transparent bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground"
          )}
        >
          <LayoutGrid className="size-4" aria-hidden />
          Tudo
        </button>

        {categories.map((category) => {
          const Icon = getCategoryIcon(category.name)
          const active = activeCategoryId === category.id

          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(active ? null : category.id)}
              className={cn(
                CHIP,
                active ? "border-transparent bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden />
              {category.name}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
