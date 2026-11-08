import { createContext, useCallback, useMemo, useState, type ReactNode } from "react"
import { readFavorites, writeFavorites } from "@/lib/storeMemory"

export interface FavoritesContextValue {
  favoriteIds: ReadonlySet<string>
  isFavorite: (productId: string) => boolean
  toggleFavorite: (productId: string) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const FavoritesContext = createContext<FavoritesContextValue | null>(null)

interface FavoritesProviderProps {
  slug: string
  children: ReactNode
}

// Favoritos por loja, guardados no aparelho (sem login).
export function FavoritesProvider({ slug, children }: FavoritesProviderProps) {
  const [ids, setIds] = useState<string[]>(() => readFavorites(slug))

  const toggleFavorite = useCallback(
    (productId: string) => {
      setIds((current) => {
        const next = current.includes(productId)
          ? current.filter((id) => id !== productId)
          : [...current, productId]
        writeFavorites(slug, next)
        return next
      })
    },
    [slug]
  )

  const value = useMemo<FavoritesContextValue>(() => {
    const favoriteIds = new Set(ids)
    return {
      favoriteIds,
      isFavorite: (productId) => favoriteIds.has(productId),
      toggleFavorite,
    }
  }, [ids, toggleFavorite])

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}
