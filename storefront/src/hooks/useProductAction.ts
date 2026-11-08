import { toast } from "sonner"
import { useCart } from "@/hooks/useCart"
import type { Product } from "@/types"

// "Montar" quando há algo para escolher ou tirar (abre o produto); senão
// "Adicionar" direto ao carrinho. Compartilhado pelos cartões do cardápio,
// da seção de favoritos da home e da folha de favoritos.
export function useProductAction(product: Product, categoryName: string, onCustomize: () => void) {
  const { addItem } = useCart()

  const customizable =
    product.variants.length > 0 || product.extras.length > 0 || (product.ingredients?.length ?? 0) > 0

  const run = (event: React.MouseEvent) => {
    event.stopPropagation()

    if (customizable) {
      onCustomize()
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

  return { customizable, run }
}
