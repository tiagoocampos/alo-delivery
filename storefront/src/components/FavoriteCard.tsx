import { Plus } from "lucide-react"
import { FavoriteHeart } from "@/components/FavoriteHeart"
import { formatCents } from "@/lib/money"
import { useProductAction } from "@/hooks/useProductAction"
import type { Product } from "@/types"

interface FavoriteCardProps {
  product: Product
  categoryName: string
  onSelect: () => void
}

// Cartão compacto da faixa "Seus favoritos" da home.
export function FavoriteCard({ product, categoryName, onSelect }: FavoriteCardProps) {
  const { customizable, run } = useProductAction(product, categoryName, onSelect)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        }
      }}
      className="flex w-[15.5rem] shrink-0 cursor-pointer snap-start flex-col gap-2 rounded-3xl bg-surface p-4 text-on-dark shadow-md shadow-black/10 outline-none focus-visible:ring-3 focus-visible:ring-ring"
    >
      <div className="flex items-start gap-1">
        <h3 className="font-heading line-clamp-2 min-w-0 flex-1 break-words text-lg text-accent-title">{product.name}</h3>
        <FavoriteHeart productId={product.id} productName={product.name} className="-mr-2 -mt-2" />
      </div>

      <div className="mt-auto flex items-end justify-between gap-2 pt-1">
        <span className="text-xl font-extrabold tabular-nums text-on-dark">{formatCents(product.basePrice ?? 0)}</span>
        <button
          type="button"
          onClick={run}
          aria-label={`${customizable ? "Montar" : "Adicionar"} ${product.name}`}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition-transform active:scale-95"
        >
          <Plus className="size-4" strokeWidth={3} aria-hidden />
          {customizable ? "Montar" : "Adicionar"}
        </button>
      </div>
    </div>
  )
}
