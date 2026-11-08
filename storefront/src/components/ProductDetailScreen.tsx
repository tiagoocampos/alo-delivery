import { useState } from "react"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { AddButton, ItemModal, OptionButton, QuantityStepper, SectionTitle } from "@/components/ItemModal"
import { modalTextareaClass } from "@/lib/modalStyles"
import { cn } from "@/lib/utils"
import { formatCents } from "@/lib/money"
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
  const [variantId, setVariantId] = useState<string | undefined>(product.variants[0]?.id)
  const [extraIds, setExtraIds] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState("")
  const [imageFailed, setImageFailed] = useState(false)

  const favorite = isFavorite(product.id)
  const selectedVariant = product.variants.find((variant) => variant.id === variantId)
  const selectedExtras = product.extras.filter((extra) => extraIds.includes(extra.id))
  const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0)
  const unitPrice = (product.basePrice ?? 0) + (selectedVariant?.priceDelta ?? 0) + extrasTotal
  const total = unitPrice * quantity

  const toggleExtra = (extraId: string) => {
    setExtraIds((current) =>
      current.includes(extraId) ? current.filter((id) => id !== extraId) : [...current, extraId]
    )
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
      unitPrice,
      quantity,
      note: note.trim() || undefined,
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
        <SectionTitle hint="Opcional">Observação</SectionTitle>
        <Textarea
          id="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Ex: sem cebola, ponto da carne, etc."
          aria-label="Observação do item"
          className={modalTextareaClass}
        />
      </section>
    </ItemModal>
  )
}
