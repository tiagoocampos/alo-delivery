import { ChevronRight } from "lucide-react"
import { ProductCard } from "@/components/ProductCard"
import type { Category, Product } from "@/types"

interface ProductListProps {
  categories: Category[]
  mostOrdered?: { product: Product; categoryName: string }[]
  emptyMessage?: string
  onSelectProduct: (product: Product, categoryName: string) => void
  onSelectCategory: (category: Category) => void
}

const HEADING_CLASS = "pb-3 pt-6 font-heading text-3xl leading-none text-accent-heading"
const GRID_CLASS = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"

export function ProductList({
  categories,
  mostOrdered = [],
  emptyMessage = "Nenhum produto encontrado.",
  onSelectProduct,
  onSelectCategory,
}: ProductListProps) {
  if (categories.length === 0 && mostOrdered.length === 0) {
    return <p className="px-4 py-12 text-center text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4">
      {mostOrdered.length > 0 && (
        <section className="flex flex-col">
          <h2 className={HEADING_CLASS}>Mais pedidos</h2>
          <div className={GRID_CLASS}>
            {mostOrdered.map(({ product, categoryName }) => (
              <ProductCard
                key={product.id}
                product={product}
                categoryName={categoryName}
                onSelect={() => onSelectProduct(product, categoryName)}
              />
            ))}
          </div>
        </section>
      )}

      {categories.map((category) => (
        <section key={category.id} className="flex flex-col">
          <h2 className={HEADING_CLASS}>{category.name}</h2>

          {category.sizes.length > 0 ? (
            <button
              type="button"
              onClick={() => onSelectCategory(category)}
              className="flex min-h-20 w-full items-center justify-between gap-3 rounded-3xl bg-surface px-5 py-4 text-left text-on-dark shadow-md shadow-black/10 transition-transform active:scale-[0.99] sm:max-w-md"
            >
              <span className="flex flex-col gap-0.5">
                <span className="font-heading text-[1.75rem] leading-none text-accent-title">
                  Monte sua {category.name}
                </span>
                <span className="text-sm text-on-dark-muted">Escolha o tamanho e os sabores</span>
              </span>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <ChevronRight className="size-5" />
              </span>
            </button>
          ) : (
            <div className={GRID_CLASS}>
              {category.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={category.name}
                  onSelect={() => onSelectProduct(product, category.name)}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
