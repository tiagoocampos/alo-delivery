import { createContext, useMemo, useState, type ReactNode } from "react"
import type { CartItem } from "@/types"

interface AddItemInput {
  productId: string
  productName: string
  categoryName: string
  variantId?: string
  variantName?: string
  flavorIds?: string[]
  flavorNames?: string[]
  crustId?: string
  crustName?: string
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

function buildKey(productId: string, variantId?: string, flavorIds?: string[], crustId?: string) {
  const variantPart = variantId ? `:${variantId}` : ""
  const flavorsPart = flavorIds && flavorIds.length > 0 ? `:f(${[...flavorIds].sort().join(",")})` : ""
  const crustPart = crustId ? `:c(${crustId})` : ""
  return `${productId}${variantPart}${flavorsPart}${crustPart}`
}

export const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (input: AddItemInput) => {
    const key = buildKey(input.productId, input.variantId, input.flavorIds, input.crustId)

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
  }

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(key)
      return
    }

    setItems((current) => current.map((item) => (item.key === key ? { ...item, quantity } : item)))
  }

  const removeItem = (key: string) => {
    setItems((current) => current.filter((item) => item.key !== key))
  }

  const clear = () => setItems([])

  const { totalCount, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        totalCount: acc.totalCount + item.quantity,
        subtotal: acc.subtotal + item.unitPrice * item.quantity,
      }),
      { totalCount: 0, subtotal: 0 }
    )
  }, [items])

  const value: CartContextValue = {
    items,
    totalCount,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clear,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export type { CartContextValue }
