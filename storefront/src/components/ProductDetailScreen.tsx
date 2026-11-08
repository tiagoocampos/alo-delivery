import { useState } from "react"
import { Check, Heart } from "lucide-react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { AddButton, ItemModal, OptionButton, QuantityStepper, SectionTitle } from "@/components/ItemModal"
import { modalTextareaClass } from "@/lib/modalStyles"
import { cn } from "@/lib/utils"
import { formatCents } from "@/lib/money"
import { maxObservationLength } from "@/lib/itemNote"
import { useCart } from "@/hooks/useCart"
import { useFavorites } from "@/hooks/useFavorites"
import type { Product } from "@/types"

interface ProductDetailScreenProps {
  product: Product | null
  categoryName: string
  onClose: () => void
}

export function ProductDetailScreen({ product, categoryName, onClose }: ProductDetailScreenProps) {
  if (!product) return null

  return <ProductDetailBody key={product.id} product={product} categoryName={categoryName} onClose={onClose} />
}

interface ProductDetailBodyProps {
  product: Product
  categoryName: string
  onClose: () => void
}

function ProductDetailBody({ product, categoryName, onClose }: ProductDetailBodyProps) {
  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const ingredients = product.ingredients ?? []
  const [variantId, setVariantId] = useState<string | undefined>(product.variants[0]?.id)
  const [extraIds, setExtraIds] = useState<string[]>([])
  const [removed, setRemoved] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState("")
  const [noteNotice, setNoteNotice] = useState("")
  const [imageFailed, setImageFailed] = useState(false)

  const favorite = isFavorite(product.id)
  const selectedVariant = product.variants.find((variant) => variant.id === variantId)
  const selectedExtras = product.extras.filter((extra) => extraIds.includes(extra.id))
  const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0)
  // Remover ingrediente nunca muda o preço: só variante e adicionais entram na conta.
  const unitPrice = (product.basePrice ?? 0) + (selectedVariant?.priceDelta ?? 0) + extrasTotal
  const total = unitPrice * quantity

  // Na ordem em que aparecem no produto.
  const removedInOrder = ingredients.filter((name) => removed.includes(name))
  const keptCount = ingredients.length - removedInOrder.length
  const observationLimit = maxObservationLength(removedInOrder)

  const toggleExtra = (extraId: string) => {
    setExtraIds((current) =>
      current.includes(extraId) ? current.filter((id) => id !== extraId) : [...current, extraId]
    )
  }

  const setRemovedList = (nextRemoved: string[]) => {
    setRemoved(nextRemoved)

    // A linha "SEM:" ocupa espaço do mesmo limite da observação: se desmarcar
    // mais ingredientes fizer o texto do cliente não caber, encurta a
    // observação (nunca a linha "SEM:") e avisa.
    const nextLimit = maxObservationLength(ingredients.filter((name) => nextRemoved.includes(name)))
    if (note.length > nextLimit) {
      setNote(note.slice(0, nextLimit))
      setNoteNotice("A observação foi encurtada para caber junto da lista de ingredientes retirados.")
    }
  }

  const toggleIngredient = (name: string) => {
    setRemovedList(removed.includes(name) ? removed.filter((item) => item !== name) : [...removed, name])
  }

  const restoreAll = () => {
    setRemoved([])
    setNoteNotice("")
  }

  const handleAdd = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      categoryName,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      extraIds: selectedExtras.length > 0 ? selectedExtras.map((extra) => extra.id) : undefined,
      extraNames: selectedExtras.length > 0 ? selectedExtras.map((extra) => extra.name) : undefined,
      removedIngredients: removedInOrder.length > 0 ? removedInOrder : undefined,
      unitPrice,
      quantity,
      note: note.trim().slice(0, observationLimit).trim() || undefined,
      imageUrl: product.imageUrl,
    })
    toast.success(`${product.name} adicionado ao carrinho`)
    onClose()
  }

  return (
    <ItemModal
      label="Personalizar item"
      title={product.name}
      description={product.description}
      onClose={onClose}
      headerActions={
        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-pressed={favorite}
          aria-label={favorite ? "Remover dos favoritos" : "Favoritar"}
          className="flex size-11 items-center justify-center rounded-full text-on-dark hover:bg-white/10"
        >
          <Heart className={cn("size-5", favorite && "fill-current text-accent-title")} />
        </button>
      }
      footer={
        <>
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <AddButton label="Adicionar ao pedido" shortLabel="Adicionar" price={formatCents(total)} onClick={handleAdd} />
        </>
      }
    >
      {product.imageUrl && !imageFailed && (
        <img
          src={product.imageUrl}
          alt=""
          decoding="async"
          onError={() => setImageFailed(true)}
          className="aspect-video max-h-44 w-full shrink-0 rounded-2xl object-cover"
        />
      )}

      {ingredients.length > 0 && (
        <section className="flex flex-col gap-2.5" aria-label="Ingredientes">
          <SectionTitle hint="Toque para remover">Ingredientes</SectionTitle>

          <div className="flex items-center justify-between gap-2 text-xs text-on-dark-muted">
            <span aria-live="polite">
              {keptCount} de {ingredients.length} mantidos
            </span>
            {removedInOrder.length > 0 && (
              <button
                type="button"
                onClick={restoreAll}
                className="-my-2 min-h-11 px-1 font-semibold text-accent-title underline-offset-2 hover:underline"
              >
                Restaurar todos
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {ingredients.map((name) => {
              const kept = !removed.includes(name)

              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={kept}
                  onClick={() => toggleIngredient(name)}
                  className={cn(
                    "inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-left text-sm font-semibold transition-colors",
                    kept
                      ? "border-accent-title bg-white/10 text-on-dark"
                      : "border-white/15 bg-transparent text-on-dark-muted line-through"
                  )}
                >
                  {kept && <Check className="size-4 shrink-0 text-accent-title" strokeWidth={3} aria-hidden />}
                  <span className="min-w-0 break-words">{name}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {product.variants.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Opções">
          <SectionTitle>Escolha uma opção</SectionTitle>
          <div role="radiogroup" className="flex flex-col gap-2">
            {product.variants.map((variant) => (
              <OptionButton
                key={variant.id}
                kind="radio"
                selected={variantId === variant.id}
                onClick={() => setVariantId(variant.id)}
                trailing={
                  variant.priceDelta !== 0
                    ? `${variant.priceDelta > 0 ? "+" : ""}${formatCents(variant.priceDelta)}`
                    : undefined
                }
              >
                {variant.name}
              </OptionButton>
            ))}
          </div>
        </section>
      )}

      {product.extras.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Adicionais">
          <SectionTitle hint="Opcional">Adicionais</SectionTitle>
          <div className="flex flex-col gap-2">
            {product.extras.map((extra) => (
              <OptionButton
                key={extra.id}
                kind="check"
                selected={extraIds.includes(extra.id)}
                onClick={() => toggleExtra(extra.id)}
                trailing={`+${formatCents(extra.price)}`}
              >
                {extra.name}
              </OptionButton>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <SectionTitle hint="Opcional">Alguma observação?</SectionTitle>
        <Textarea
          id="note"
          value={note}
          maxLength={observationLimit}
          disabled={observationLimit === 0}
          onChange={(event) => {
            setNote(event.target.value)
            setNoteNotice("")
          }}
          placeholder="Ex: ponto da carne, capricha no molho..."
          aria-label="Observação do item"
          className={modalTextareaClass}
        />
        <div className="flex items-start justify-between gap-3 text-xs text-on-dark-muted">
          <span role="status">
            {observationLimit === 0
              ? "Muitos ingredientes retirados: não há espaço para observação."
              : noteNotice}
          </span>
          {observationLimit > 0 && (
            <span className="shrink-0 tabular-nums">
              {note.length}/{observationLimit}
            </span>
          )}
        </div>
      </section>
    </ItemModal>
  )
}
