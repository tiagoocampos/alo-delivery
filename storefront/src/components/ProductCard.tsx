import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { formatCents } from "@/lib/money"
import { getCategoryIcon } from "@/lib/categoryVisuals"
import { useCart } from "@/hooks/useCart"
import type { Product, ProductBadge } from "@/types"

interface ProductCardProps {
  product: Product
  categoryName: string
  onSelect: () => void
}

const BADGE_CONFIG: Record<ProductBadge, { label: string; variant: "default" | "destructive" | "secondary" }> = {
  mais_pedido: { label: "Mais pedido", variant: "default" },
  promocao: { label: "Promoção", variant: "destructive" },
  novo: { label: "Novo", variant: "secondary" },
}

export function ProductCard({ product, categoryName, onSelect }: ProductCardProps) {
  const { addItem } = useCart()
  const Icon = getCategoryIcon(categoryName)
  const hasVariants = product.variants.length > 0
  const badge = product.badge ? BADGE_CONFIG[product.badge] : null

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onSelect()
    }
  }

  const handleQuickAdd = (event: React.MouseEvent) => {
    event.stopPropagation()
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

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className="flex w-full cursor-pointer items-center gap-3 border-b border-border py-4 text-left transition-colors last:border-b-0 hover:bg-muted/50"
    >
      <div className="relative shrink-0">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt="" className="size-24 rounded-xl object-cover" />
        ) : (
          <span className="flex size-24 items-center justify-center rounded-xl bg-muted">
            <Icon className="size-8 text-muted-foreground" strokeWidth={1.5} />
          </span>
        )}

        {badge && (
          <Badge variant={badge.variant} className="absolute left-1 top-1">
            {badge.label}
          </Badge>
        )}

        {!hasVariants && (
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label={`Adicionar ${product.name}`}
            className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105"
          >
            <Plus className="size-4" strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-foreground">{product.name}</span>
        {product.description && (
          <span className="line-clamp-2 text-xs text-muted-foreground">{product.description}</span>
        )}
        <span className="mt-0.5 text-sm font-semibold text-primary">
          {hasVariants ? "a partir de " : ""}
          {formatCents(product.basePrice ?? 0)}
        </span>
      </div>
    </div>
  )
}
