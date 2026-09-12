import { useEffect, useState } from "react"
import { ArrowLeft, Check, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { formatCents } from "@/lib/money"
import { getCategoryIcon } from "@/lib/categoryVisuals"
import { useCart } from "@/hooks/useCart"
import { toast } from "sonner"
import type { Category } from "@/types"

interface CategoryOrderScreenProps {
  category: Category | null
  onClose: () => void
}

export function CategoryOrderScreen({ category, onClose }: CategoryOrderScreenProps) {
  useEffect(() => {
    if (!category) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [category, onClose])

  if (!category) return null

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background">
      <CategoryOrderBody key={category.id} category={category} onAdded={onClose} onBack={onClose} />
    </div>
  )
}

interface CategoryOrderBodyProps {
  category: Category
  onAdded: () => void
  onBack: () => void
}

function CategoryOrderBody({ category, onAdded, onBack }: CategoryOrderBodyProps) {
  const { addItem } = useCart()
  const [sizeId, setSizeId] = useState<string | undefined>(undefined)
  const [flavorProductIds, setFlavorProductIds] = useState<string[]>([])
  const [crustId, setCrustId] = useState<string | undefined>(undefined)
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState("")

  const selectedSize = category.sizes.find((size) => size.id === sizeId)
  const selectedCrust = category.crusts.find((crust) => crust.id === crustId)
  const maxFlavors = selectedSize?.maxFlavors
  const FlavorIcon = getCategoryIcon(category.name)

  // Se o tamanho mudar para um limite menor, mantém só os primeiros sabores já marcados.
  useEffect(() => {
    if (maxFlavors === undefined) return
    setFlavorProductIds((current) => (current.length > maxFlavors ? current.slice(0, maxFlavors) : current))
  }, [maxFlavors])

  const toggleFlavor = (flavorProductId: string) => {
    setFlavorProductIds((current) => {
      if (current.includes(flavorProductId)) return current.filter((id) => id !== flavorProductId)
      if (maxFlavors !== undefined && current.length >= maxFlavors) return current
      return [...current, flavorProductId]
    })
  }

  const unitPrice = (selectedSize?.price ?? 0) + (selectedCrust?.priceDelta ?? 0)
  const total = unitPrice * quantity
  const canAdd = Boolean(selectedSize) && flavorProductIds.length >= 1

  const handleAdd = () => {
    if (!selectedSize) return

    const flavorNames = category.products
      .filter((product) => flavorProductIds.includes(product.id))
      .map((product) => product.name)

    addItem({
      categoryName: category.name,
      categorySizeId: selectedSize.id,
      categorySizeName: selectedSize.name,
      flavorProductIds,
      flavorProductNames: flavorNames,
      categoryCrustId: selectedCrust?.id,
      categoryCrustName: selectedCrust?.name,
      unitPrice,
      quantity,
      note: note.trim() || undefined,
      imageUrl: null,
    })
    toast.success(`${category.name} ${selectedSize.name} adicionado ao carrinho`)
    onAdded()
  }

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-brand px-2 py-2.5 text-brand-foreground">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Voltar" className="text-brand-foreground hover:bg-brand-foreground/10 hover:text-brand-foreground">
          <ArrowLeft />
        </Button>
        <span className="truncate font-heading text-sm font-semibold">{category.name}</span>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-4 pb-28">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-xl font-bold text-foreground">{category.name}</h1>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Escolha o tamanho</Label>
          <div className="flex flex-col gap-2">
            {category.sizes.map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => setSizeId(size.id)}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors",
                  sizeId === size.id
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border text-foreground"
                )}
              >
                <span>{size.name}</span>
                <span className="text-xs text-muted-foreground">{formatCents(size.price)}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedSize && (
          <div className="flex flex-col gap-2">
            <Label>
              Escolha até {selectedSize.maxFlavors} {selectedSize.maxFlavors === 1 ? "sabor" : "sabores"}
            </Label>
            <div className="flex flex-col gap-2">
              {category.products.map((product) => {
                const checked = flavorProductIds.includes(product.id)
                const disabled = !checked && flavorProductIds.length >= selectedSize.maxFlavors

                return (
                  <button
                    key={product.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleFlavor(product.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                      checked
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border text-foreground",
                      disabled && "opacity-40"
                    )}
                  >
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <FlavorIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
                      </span>
                    )}
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate font-medium">{product.name}</span>
                      {product.description && (
                        <span className="line-clamp-1 text-xs text-muted-foreground">{product.description}</span>
                      )}
                    </span>
                    {checked && <Check className="size-4 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {category.crusts.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label>Escolha a borda</Label>
            <div className="flex flex-col gap-2">
              {category.crusts.map((crust) => (
                <button
                  key={crust.id}
                  type="button"
                  onClick={() => setCrustId(crust.id)}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors",
                    crustId === crust.id
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border text-foreground"
                  )}
                >
                  <span>{crust.name}</span>
                  {crust.priceDelta !== 0 && (
                    <span className="text-xs text-muted-foreground">
                      {crust.priceDelta > 0 ? "+" : ""}
                      {formatCents(crust.priceDelta)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="note">Observação (opcional)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ex: sem cebola, bem passado, etc."
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Quantidade</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Diminuir quantidade"
            >
              <Minus />
            </Button>
            <span className="w-6 text-center text-sm font-medium">{quantity}</span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Aumentar quantidade"
            >
              <Plus />
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background p-3">
        <Button onClick={handleAdd} disabled={!canAdd} size="lg" className="w-full">
          {!selectedSize
            ? "Escolha um tamanho"
            : canAdd
              ? `Adicionar · ${formatCents(total)}`
              : "Escolha ao menos 1 sabor"}
        </Button>
      </div>
    </>
  )
}
