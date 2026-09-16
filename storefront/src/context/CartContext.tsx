import { createContext, useCallback, useMemo, useState, type ReactNode } from "react"
import type { CartItem } from "@/types"

interface AddItemInput {
  productId?: string
  productName?: string
  categoryName: string
  variantId?: string
  variantName?: string
  categorySizeId?: string
  categorySizeName?: string
  categoryCrustId?: string
  categoryCrustName?: string
  flavorProductIds?: string[]
  flavorProductNames?: string[]
  extraIds?: string[]
  extraNames?: string[]
  unitPrice: number
  quantity: number
  note?: string
  imageUrl: string | null
}

interface CartContextValue {
  items: CartItem[]
  totalCount: number
  subtotal: number
  addItem: (input: AddItemInput) => void
  updateQuantity: (key: string, quantity: number) => void
  removeItem: (key: string) => void
  clear: () => void
}

function buildKey(input: AddItemInput) {
  if (input.categorySizeId) {
    const flavorsPart =
      input.flavorProductIds && input.flavorProductIds.length > 0
        ? `:f(${[...input.flavorProductIds].sort().join(",")})`
        : ""
    const crustPart = input.categoryCrustId ? `:c(${input.categoryCrustId})` : ""
    return `size:${input.categorySizeId}${flavorsPart}${crustPart}`
  }

  const variantPart = input.variantId ? `:${input.variantId}` : ""
  const extrasPart =
    input.extraIds && input.extraIds.length > 0 ? `:e(${[...input.extraIds].sort().join(",")})` : ""
  return `${input.productId}${variantPart}${extrasPart}`
}

export const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((input: AddItemInput) => {
    const key = buildKey(input)

    setItems((current) => {
      const existing = current.find((item) => item.key === key)

      if (existing) {
        return current.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + input.quantity, note: input.note ?? item.note }
            : item
        )
      }

      return [...current, { key, ...input }]
    })
  }, [])

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key))
  }, [])

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(key)
      return
    }

    setItems((current) => current.map((item) => (item.key === key ? { ...item, quantity } : item)))
  }, [removeItem])

  const clear = useCallback(() => setItems([]), [])

  const { totalCount, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        totalCount: acc.totalCount + item.quantity,
        subtotal: acc.subtotal + item.unitPrice * item.quantity,
      }),
      { totalCount: 0, subtotal: 0 }
    )
  }, [items])

  // Memoizado pra não recriar o objeto de contexto a cada render do provider —
  // sem isso, todo consumidor de useCart() (produtos, header, carrinho) re-renderiza
  // mesmo quando o carrinho em si não muda.
  const value: CartContextValue = useMemo(
    () => ({
      items,
      totalCount,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [items, totalCount, subtotal, addItem, updateQuantity, removeItem, clear]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export type { CartContextValue }
