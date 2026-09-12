import { ChevronRight } from "lucide-react"
import { ProductCard } from "@/components/ProductCard"
import type { Category, Product } from "@/types"

interface ProductListProps {
  categories: Category[]
  mostOrdered?: { product: Product; categoryName: string }[]
  onSelectProduct: (product: Product, categoryName: string) => void
  onSelectCategory: (category: Category) => void
}

const HEADING_CLASS = "pt-6 pb-2 font-heading text-lg font-extrabold uppercase tracking-wide text-foreground"

export function ProductList({ categories, mostOrdered = [], onSelectProduct, onSelectCategory }: ProductListProps) {
  if (categories.length === 0 && mostOrdered.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum produto encontrado.
      </p>
    )
  }

  return (
    <div className="flex flex-col">
      {mostOrdered.length > 0 && (
        <section className="flex flex-col px-3">
          <h2 className={HEADING_CLASS}>Mais pedidos</h2>
          <div className="flex flex-col">
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
        <section key={category.id} className="flex flex-col px-3">
          <h2 className={HEADING_CLASS}>{category.name}</h2>
          <div className="flex flex-col">
            {category.sizes.length > 0 ? (
              <button
                type="button"
                onClick={() => onSelectCategory(category)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-accent px-4 py-4 text-left transition-colors hover:bg-accent/80"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-accent-foreground">
                    Monte sua {category.name.toLowerCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">Escolha o tamanho e os sabores</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-accent-foreground" />
              </button>
            ) : (
              category.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={category.name}
                  onSelect={() => onSelectProduct(product, category.name)}
                />
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
