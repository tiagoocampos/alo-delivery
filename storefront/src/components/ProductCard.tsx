import { formatCents } from "@/lib/money"
import { getCategoryIcon } from "@/lib/categoryVisuals"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
  categoryName: string
  onSelect: () => void
}

export function ProductCard({ product, categoryName, onSelect }: ProductCardProps) {
  const Icon = getCategoryIcon(categoryName)
  const hasVariants = product.variants.length > 0

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 border-b border-border py-3 text-left transition-colors last:border-b-0 hover:bg-muted/50"
    >
      {product.imageUrl ? (
        <img src={product.imageUrl} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
      ) : (
        <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Icon className="size-6 text-muted-foreground" strokeWidth={1.5} />
        </span>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-foreground">{product.name}</span>
        {product.description && (
          <span className="line-clamp-2 text-xs text-muted-foreground">{product.description}</span>
        )}
        <span className="mt-0.5 text-sm font-semibold text-primary">
          {hasVariants ? "a partir de " : ""}
          {formatCents(product.basePrice)}
        </span>
      </div>
    </button>
  )
}
