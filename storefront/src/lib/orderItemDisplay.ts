import type { OrderItemResult } from "@/types"

export function formatOrderItemTitle(item: OrderItemResult): string {
  if (item.product) return item.product.name
  if (item.categorySize) return `${item.categorySize.category.name} ${item.categorySize.name}`
  return "Item"
}
