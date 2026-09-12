import { ProductCard } from "@/components/ProductCard"
import type { Category, Product } from "@/types"

interface ProductListProps {
  categories: Category[]
  mostOrdered?: { product: Product; categoryName: string }[]
  onSelectProduct: (product: Product, categoryName: string) => void
}

const HEADING_CLASS = "pt-6 pb-2 font-heading text-lg font-extrabold uppercase tracking-wide text-foreground"

export function ProductList({ categories, mostOrdered = [], onSelectProduct }: ProductListProps) {
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
            {category.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categoryName={category.name}
                onSelect={() => onSelectProduct(product, category.name)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
