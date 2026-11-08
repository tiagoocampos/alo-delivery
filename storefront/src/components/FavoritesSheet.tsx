import { Heart } from "lucide-react"
import { SheetShell } from "@/components/shell/SheetShell"
import { ProductCard } from "@/components/ProductCard"
import { useCustomerAuth } from "@/hooks/useCustomerAuth"
import type { Product } from "@/types"

export interface FavoriteEntry {
  product: Product
  categoryName: string
}

interface FavoritesSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Só favoritos que ainda existem e estão ativos no cardápio.
  entries: FavoriteEntry[]
  onSelectProduct: (product: Product, categoryName: string) => void
  onOpenAccount: () => void
}

export function FavoritesSheet({ open, onOpenChange, entries, onSelectProduct, onOpenAccount }: FavoritesSheetProps) {
  const { isAuthenticated } = useCustomerAuth()

  return (
    <SheetShell open={open} onOpenChange={onOpenChange} title="Meus favoritos" bodyClassName="gap-4 px-4 pb-4">
      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-surface text-accent-title">
            <Heart className="size-6" aria-hidden />
          </span>
          <p className="max-w-64 text-sm text-muted-foreground">
            Você ainda não tem favoritos. Toque no ♥ nos produtos para guardá-los aqui.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map(({ product, categoryName }) => (
            <li key={product.id} className="contents">
              <ProductCard
                product={product}
                categoryName={categoryName}
                onSelect={() => {
                  onOpenChange(false)
                  onSelectProduct(product, categoryName)
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {!isAuthenticated && (
        <div className="flex flex-col gap-2 rounded-2xl border border-border p-4 text-sm">
          <p className="text-muted-foreground">Entre na sua conta para guardar seus favoritos em qualquer aparelho.</p>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false)
              onOpenAccount()
            }}
            className="min-h-11 self-start rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground"
          >
            Entrar / Criar conta
          </button>
        </div>
      )}
    </SheetShell>
  )
}
