import {
  Beer,
  IceCreamCone,
  Pizza,
  Salad,
  Sandwich,
  Soup,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react"

const KEYWORD_ICONS: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ["pizza"], icon: Pizza },
  { keywords: ["xis", "burger", "hamb", "lanche", "cachorro", "dog"], icon: Sandwich },
  { keywords: ["bebida", "chopp", "cerveja", "suco", "refri", "drink"], icon: Beer },
  { keywords: ["sobremesa", "doce", "sorvete", "acai", "açaí"], icon: IceCreamCone },
  { keywords: ["salada", "veget", "fit"], icon: Salad },
  { keywords: ["sopa", "caldo", "porção", "porcao"], icon: Soup },
]

export function getCategoryIcon(categoryName: string): LucideIcon {
  const normalized = categoryName.toLowerCase()
  const match = KEYWORD_ICONS.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword))
  )

  return match?.icon ?? UtensilsCrossed
}
