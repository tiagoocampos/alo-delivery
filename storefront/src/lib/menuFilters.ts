import type { Category, Product, ProductBadge } from "@/types"

export type QuickFilter = "todos" | ProductBadge | "ate" | "favoritos"

export interface QuickFilterOption {
  id: QuickFilter
  label: string
}

// Produtos que têm preço próprio (sabores de categoria com tamanho ficam de fora).
function pricedProducts(categories: Category[]): Product[] {
  return categories
    .filter((category) => category.sizes.length === 0)
    .flatMap((category) => category.products)
    .filter((product) => product.basePrice !== null)
}

// Teto do filtro "Até R$ X": múltiplo de R$ 5 próximo do 1º quartil dos
// preços. Só vale a pena quando separa o cardápio em dois grupos não vazios.
export function getPriceCeiling(categories: Category[]): number | null {
  const prices = pricedProducts(categories)
    .map((product) => product.basePrice as number)
    .sort((a, b) => a - b)

  if (prices.length < 4) return null

  const quartile = prices[Math.floor((prices.length - 1) * 0.25)]!
  const ceiling = Math.max(500, Math.round(quartile / 500) * 500)
  const within = prices.filter((price) => price <= ceiling).length

  return within >= 1 && within < prices.length ? ceiling : null
}

export function matchesQuickFilter(
  filter: QuickFilter,
  product: Product,
  priceCeiling: number | null,
  isFavorite: (productId: string) => boolean
): boolean {
  switch (filter) {
    case "todos":
      return true
    case "mais_pedido":
    case "promocao":
    case "novo":
      return product.badge === filter
    case "ate":
      return priceCeiling !== null && product.basePrice !== null && product.basePrice <= priceCeiling
    case "favoritos":
      return isFavorite(product.id)
  }
}

// Só oferece filtro que tenha ao menos um produto para mostrar.
export function getQuickFilterOptions(
  categories: Category[],
  priceCeiling: number | null,
  hasFavorites: boolean,
  formatPrice: (cents: number) => string
): QuickFilterOption[] {
  const products = pricedProducts(categories)
  const options: QuickFilterOption[] = [{ id: "todos", label: "Todos" }]

  if (products.some((product) => product.badge === "mais_pedido")) options.push({ id: "mais_pedido", label: "Mais pedidos" })
  if (products.some((product) => product.badge === "promocao")) options.push({ id: "promocao", label: "Promoções" })
  if (products.some((product) => product.badge === "novo")) options.push({ id: "novo", label: "Novidades" })
  if (priceCeiling !== null) options.push({ id: "ate", label: `Até ${formatPrice(priceCeiling)}` })
  if (hasFavorites) options.push({ id: "favoritos", label: "Favoritos" })

  return options
}

// "Buscar por X-Burguer, Pizza ou Refrigerante..." com nomes reais do cardápio:
// mais pedidos primeiro, depois um produto de cada categoria.
export function buildSearchPlaceholder(categories: Category[]): string {
  const shortName = (name: string) => name.trim().split(/\s+/).slice(0, 2).join(" ")

  const candidates: string[] = []
  const push = (name: string) => {
    const short = shortName(name)
    if (short && short.length <= 22 && !candidates.some((c) => c.toLowerCase() === short.toLowerCase())) {
      candidates.push(short)
    }
  }

  const priced = categories.filter((category) => category.sizes.length === 0)
  priced.flatMap((category) => category.products).filter((p) => p.badge === "mais_pedido").forEach((p) => push(p.name))
  priced.forEach((category) => category.products[0] && push(category.products[0].name))
  categories.filter((category) => category.sizes.length > 0).forEach((category) => push(category.name))

  const picked = candidates.slice(0, 3)
  if (picked.length === 0) return "Buscar no cardápio..."
  if (picked.length === 1) return `Buscar por ${picked[0]}...`

  const last = picked[picked.length - 1]
  return `Buscar por ${picked.slice(0, -1).join(", ")} ou ${last}...`
}
