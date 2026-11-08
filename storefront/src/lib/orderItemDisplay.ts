import { parseItemNote } from "@/lib/itemNote"
import type { OrderItemResult } from "@/types"

export function formatOrderItemTitle(item: OrderItemResult): string {
  if (item.product) return item.product.name
  if (item.categorySize) return `${item.categorySize.category.name} ${item.categorySize.name}`
  return "Item"
}

// Ingredientes que o cliente tirou ("SEM: tomate, milho") e a observação dele,
// já separados a partir do note que o backend devolve.
export function getOrderItemNote(item: OrderItemResult) {
  return parseItemNote(item.note)
}
