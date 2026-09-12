import { useEffect, useState } from "react"
import { ArrowLeft, Check, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { formatCents } from "@/lib/money"
import { useCart } from "@/hooks/useCart"
import { toast } from "sonner"
import type { Product } from "@/types"

interface ProductDetailScreenProps {
  product: Product | null
  categoryName: string
  onClose: () => void
}

export function ProductDetailScreen({ product, categoryName, onClose }: ProductDetailScreenProps) {
  useEffect(() => {
    if (!product) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [product, onClose])

  if (!product) return null

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background">
      <ProductDetailBody key={product.id} product={product} categoryName={categoryName} onAdded={onClose} onBack={onClose} />
    </div>
  )
}

interface ProductDetailBodyProps {
  product: Product
  categoryName: string
  onAdded: () => void
  onBack: () => void
}

function ProductDetailBody({ product, categoryName, onAdded, onBack }: ProductDetailBodyProps) {
  const { addItem } = useCart()
  const [variantId, setVariantId] = useState<string | undefined>(product.variants[0]?.id)
  const [flavorIds, setFlavorIds] = useState<string[]>([])
  const [crustId, setCrustId] = useState<string | undefined>(undefined)
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState("")

  const hasFlavors = product.flavors.length > 0
  const selectedVariant = product.variants.find((variant) => variant.id === variantId)
  const selectedCrust = product.crusts.find((crust) => crust.id === crustId)
  const maxFlavors = selectedVariant?.maxFlavors ?? undefined

  // Se o tamanho mudar para um limite menor, mantém só os primeiros sabores já marcados.
  useEffect(() => {
    if (maxFlavors === undefined) return
    setFlavorIds((current) => (current.length > maxFlavors ? current.slice(0, maxFlavors) : current))
  }, [maxFlavors])

  const toggleFlavor = (flavorId: string) => {
    setFlavorIds((current) => {
      if (current.includes(flavorId)) return current.filter((id) => id !== flavorId)
      if (maxFlavors !== undefined && current.length >= maxFlavors) return current
      return [...current, flavorId]
    })
  }

  const unitPrice = product.basePrice + (selectedVariant?.priceDelta ?? 0) + (selectedCrust?.priceDelta ?? 0)
  const total = unitPrice * quantity
  const canAdd = !hasFlavors || flavorIds.length >= 1

  const handleAdd = () => {
    const flavorNames = product.flavors
      .filter((flavor) => flavorIds.includes(flavor.id))
      .map((flavor) => flavor.name)

    addItem({
      productId: product.id,
      productName: product.name,
      categoryName,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      flavorIds: hasFlavors ? flavorIds : undefined,
      flavorNames: hasFlavors ? flavorNames : undefined,
      crustId: selectedCrust?.id,
      crustName: selectedCrust?.name,
      unitPrice,
      quantity,
      note: note.trim() || undefined,
      imageUrl: product.imageUrl,
    })
    toast.success(`${product.name} adicionado ao carrinho`)
    onAdded()
  }

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-brand px-2 py-2.5 text-brand-foreground">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Voltar" className="text-brand-foreground hover:bg-brand-foreground/10 hover:text-brand-foreground">
          <ArrowLeft />
        </Button>
        <span className="truncate font-heading text-sm font-semibold">{product.name}</span>
      </div>

      {product.imageUrl && (
        <img src={product.imageUrl} alt="" className="aspect-square w-full object-cover" />
      )}

      <div className="flex flex-1 flex-col gap-5 p-4 pb-28">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-xl font-bold text-foreground">{product.name}</h1>
          {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}
          <span className="text-lg font-bold text-primary">{formatCents(product.basePrice)}</span>
        </div>

        {product.variants.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label>Escolha uma opção</Label>
            <div className="flex flex-col gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setVariantId(variant.id)}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors",
                    variantId === variant.id
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border text-foreground"
                  )}
                >
                  <span>{variant.name}</span>
                  {variant.priceDelta !== 0 && (
                    <span className="text-xs text-muted-foreground">
                      {variant.priceDelta > 0 ? "+" : ""}
                      {formatCents(variant.priceDelta)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasFlavors && maxFlavors !== undefined && (
          <div className="flex flex-col gap-2">
            <Label>
              Escolha até {maxFlavors} {maxFlavors === 1 ? "sabor" : "sabores"}
            </Label>
            <div className="flex flex-col gap-2">
              {product.flavors.map((flavor) => {
                const checked = flavorIds.includes(flavor.id)
                const disabled = !checked && flavorIds.length >= maxFlavors

                return (
                  <button
                    key={flavor.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleFlavor(flavor.id)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors",
                      checked
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border text-foreground",
                      disabled && "opacity-40"
                    )}
                  >
                    <span>{flavor.name}</span>
                    {checked && <Check className="size-4" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {product.crusts.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label>Escolha a borda</Label>
            <div className="flex flex-col gap-2">
              {product.crusts.map((crust) => (
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
            placeholder="Ex: sem cebola, ponto da carne, etc."
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
          {canAdd ? `Adicionar · ${formatCents(total)}` : "Escolha ao menos 1 sabor"}
        </Button>
      </div>
    </>
  )
}
