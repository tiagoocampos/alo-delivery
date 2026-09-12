import { cn } from "@/lib/utils"
import { getCategoryIcon, getCategoryThumbnail } from "@/lib/categoryVisuals"
import type { Category } from "@/types"

interface CategoryCardProps {
  category: Category
  active: boolean
  onClick: () => void
}

export function CategoryCard({ category, active, onClick }: CategoryCardProps) {
  const Icon = getCategoryIcon(category.name)
  const thumbnail = getCategoryThumbnail(category)
  const itemCount = category.products.length

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-28 w-full items-center justify-center overflow-hidden bg-brand text-center",
        active && "outline-2 -outline-offset-2 outline-primary"
      )}
    >
      {thumbnail && <img src={thumbnail} alt="" className="absolute inset-0 size-full object-cover" />}

      <div className={cn("absolute inset-0", thumbnail ? "bg-brand/50" : "bg-transparent")} />

      <div className="relative flex flex-col items-center gap-0.5 px-4">
        {!thumbnail && <Icon className="mb-1 size-6 text-brand-foreground/50" strokeWidth={1.5} />}
        <span className="font-heading text-base font-bold uppercase tracking-wide text-brand-foreground">{category.name}</span>
        <span className="text-xs text-brand-foreground/75">
          {itemCount} {itemCount === 1 ? "item" : "itens"}
        </span>
      </div>
    </button>
  )
}
