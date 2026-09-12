import { ProductCard } from "@/components/ProductCard"
import type { Category, Product } from "@/types"

interface ProductListProps {
  categories: Category[]
  onSelectProduct: (product: Product, categoryName: string) => void
}

export function ProductList({ categories, onSelectProduct }: ProductListProps) {
  if (categories.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum produto encontrado.
      </p>
    )
  }

  return (
    <div className="flex flex-col">
      {categories.map((category) => (
        <section key={category.id} className="flex flex-col px-3">
          <h2 className="pt-3 pb-1 font-heading text-sm font-bold uppercase tracking-wide text-foreground">
            {category.name}
          </h2>
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
