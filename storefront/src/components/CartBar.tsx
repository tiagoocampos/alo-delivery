import { ShoppingCart } from "lucide-react"
import { formatCents } from "@/lib/money"

interface CartBarProps {
  count: number
  subtotal: number
  onClick: () => void
}

export function CartBar({ count, subtotal, onClick }: CartBarProps) {
  if (count === 0) return null

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground"
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        <span className="relative">
          <ShoppingCart className="size-5" />
          <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary-foreground text-[10px] font-bold text-primary">
            {count}
          </span>
        </span>
        {formatCents(subtotal)}
      </span>
      <span className="text-sm font-bold uppercase tracking-wide">Fechar pedido</span>
    </button>
  )
}
