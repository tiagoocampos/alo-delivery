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
        "relative flex h-28 w-full items-center justify-center overflow-hidden bg-neutral-900 text-center",
        active && "outline-2 -outline-offset-2 outline-primary"
      )}
    >
      {thumbnail && <img src={thumbnail} alt="" className="absolute inset-0 size-full object-cover" />}

      <div className={cn("absolute inset-0", thumbnail ? "bg-black/40" : "bg-transparent")} />

      <div className="relative flex flex-col items-center gap-0.5 px-4">
        {!thumbnail && <Icon className="mb-1 size-6 text-white/50" strokeWidth={1.5} />}
        <span className="text-base font-bold uppercase tracking-wide text-white">{category.name}</span>
        <span className="text-xs text-white/75">
          {itemCount} {itemCount === 1 ? "item" : "itens"}
        </span>
      </div>
    </button>
  )
}
