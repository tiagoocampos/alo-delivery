import { CategoryCard } from "@/components/CategoryCard"
import type { Category } from "@/types"

interface CategoryListProps {
  categories: Category[]
  activeCategoryId: string | null
  onSelect: (categoryId: string | null) => void
}

export function CategoryList({ categories, activeCategoryId, onSelect }: CategoryListProps) {
  return (
    <div className="flex flex-col">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          active={activeCategoryId === category.id}
          onClick={() => onSelect(activeCategoryId === category.id ? null : category.id)}
        />
      ))}
    </div>
  )
}
