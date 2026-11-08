import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFavorites } from "@/hooks/useFavorites"

interface FavoriteHeartProps {
  productId: string
  productName: string
  className?: string
}

// Coração de favoritar: muda na hora e fica desabilitado enquanto a chamada
// deste produto está em andamento (evita toques duplicados).
export function FavoriteHeart({ productId, productName, className }: FavoriteHeartProps) {
  const { isFavorite, isPending, toggleFavorite } = useFavorites()
  const favorite = isFavorite(productId)

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        toggleFavorite(productId)
      }}
      disabled={isPending(productId)}
      aria-pressed={favorite}
      aria-label={favorite ? `Remover ${productName} dos favoritos` : `Favoritar ${productName}`}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full text-on-dark-muted transition-colors hover:text-accent-title disabled:opacity-60",
        className
      )}
    >
      <Heart className={cn("size-5", favorite && "fill-current text-accent-title")} />
    </button>
  )
}
