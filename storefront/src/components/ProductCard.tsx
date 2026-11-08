import { useState } from "react"
import { Heart, Plus } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatCents } from "@/lib/money"
import { useCart } from "@/hooks/useCart"
import { useFavorites } from "@/hooks/useFavorites"
import type { Product, ProductBadge } from "@/types"

interface ProductCardProps {
  product: Product
  categoryName: string
  onSelect: () => void
}

const BADGE_CONFIG: Record<ProductBadge, { label: string; className: string }> = {
  mais_pedido: { label: "Mais pedido", className: "bg-white/15 text-on-dark" },
  promocao: { label: "Promoção", className: "bg-accent-title text-brand-dark" },
  novo: { label: "Novo", className: "bg-white/15 text-on-dark" },
}

export function ProductCard({ product, categoryName, onSelect }: ProductCardProps) {
  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [imageFailed, setImageFailed] = useState(false)

  // Foto quebrada cai sozinha no formato de texto.
  const showImage = Boolean(product.imageUrl) && !imageFailed
  const hasVariants = product.variants.length > 0
  // "Montar" quando há algo para escolher/tirar; senão adiciona direto.
  const customizable = hasVariants || product.extras.length > 0 || (product.ingredients?.length ?? 0) > 0
  const favorite = isFavorite(product.id)
  const badge = product.badge ? BADGE_CONFIG[product.badge] : null

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Enter/espaço nos botões internos não podem abrir o produto.
    if (event.target !== event.currentTarget) return

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onSelect()
    }
  }

  const handleAction = (event: React.MouseEvent) => {
    event.stopPropagation()

    if (customizable) {
      onSelect()
      return
    }

    addItem({
      productId: product.id,
      productName: product.name,
      categoryName,
      unitPrice: product.basePrice ?? 0,
      quantity: 1,
      imageUrl: product.imageUrl,
    })
    toast.success(`${product.name} adicionado ao carrinho`)
  }

  const handleFavorite = (event: React.MouseEvent) => {
    event.stopPropagation()
    toggleFavorite(product.id)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      data-product-card=""
      data-customizable={customizable}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={cn(
        "group flex cursor-pointer overflow-hidden rounded-3xl bg-surface text-on-dark shadow-md shadow-black/10 outline-none transition-shadow hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring",
        showImage ? "flex-col sm:flex-row" : "flex-col"
      )}
    >
      {showImage && (
        <div className="relative aspect-16/10 w-full shrink-0 overflow-hidden sm:m-3 sm:aspect-square sm:w-32 sm:self-start sm:rounded-2xl">
          <img
            src={product.imageUrl!}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="size-full object-cover"
          />
        </div>
      )}

      <div className={cn("flex min-w-0 flex-1 flex-col gap-2 p-4", showImage && "sm:pl-1")}>
        <div className="flex items-center gap-2">
          <span className="truncate text-[11px] font-bold uppercase tracking-widest text-accent-title">
            {categoryName}
          </span>
          {badge && (
            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", badge.className)}>
              {badge.label}
            </span>
          )}
          <button
            type="button"
            onClick={handleFavorite}
            aria-pressed={favorite}
            aria-label={favorite ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`}
            className="-my-3 -mr-3 ml-auto flex size-11 shrink-0 items-center justify-center rounded-full text-on-dark-muted transition-colors hover:text-accent-title"
          >
            <Heart className={cn("size-5", favorite && "fill-current text-accent-title")} />
          </button>
        </div>

        <h3 className="font-heading line-clamp-2 break-words text-xl text-accent-title">{product.name}</h3>

        {product.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-on-dark-muted">{product.description}</p>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-2 border-t border-white/10 pt-3">
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-dark-muted">
              {hasVariants ? "A partir de" : "Valor"}
            </span>
            <span className="mt-1 text-2xl font-extrabold tabular-nums text-on-dark">{formatCents(product.basePrice ?? 0)}</span>
          </div>

          <button
            type="button"
            onClick={handleAction}
            aria-label={`${customizable ? "Montar" : "Adicionar"} ${product.name}`}
            className="ml-auto inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-transform active:scale-95"
          >
            <Plus className="size-4" strokeWidth={3} aria-hidden />
            {customizable ? "Montar" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  )
}
