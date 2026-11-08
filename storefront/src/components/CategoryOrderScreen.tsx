import { useState } from "react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { AddButton, ItemModal, OptionButton, QuantityStepper, SectionTitle } from "@/components/ItemModal"
import { modalTextareaClass } from "@/lib/modalStyles"
import { formatCents } from "@/lib/money"
import { getCategoryIcon } from "@/lib/categoryVisuals"
import { useCart } from "@/hooks/useCart"
import type { Category } from "@/types"

interface CategoryOrderScreenProps {
  category: Category | null
  onClose: () => void
}

export function CategoryOrderScreen({ category, onClose }: CategoryOrderScreenProps) {
  if (!category) return null

  return <CategoryOrderBody key={category.id} category={category} onClose={onClose} />
}

interface CategoryOrderBodyProps {
  category: Category
  onClose: () => void
}

// Fluxo de categoria com tamanho (ex.: pizza): tamanho -> sabores -> borda.
function CategoryOrderBody({ category, onClose }: CategoryOrderBodyProps) {
  const { addItem } = useCart()
  const [sizeId, setSizeId] = useState<string | undefined>(undefined)
  const [flavorProductIds, setFlavorProductIds] = useState<string[]>([])
  const [crustId, setCrustId] = useState<string | undefined>(undefined)
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState("")

  const selectedSize = category.sizes.find((size) => size.id === sizeId)
  const selectedCrust = category.crusts.find((crust) => crust.id === crustId)
  const FlavorIcon = getCategoryIcon(category.name)

  // Trocar para um tamanho com limite menor de sabores mantém só os primeiros já marcados.
  const handleSelectSize = (nextSizeId: string) => {
    const nextSize = category.sizes.find((size) => size.id === nextSizeId)
    setSizeId(nextSizeId)
    if (nextSize) {
      setFlavorProductIds((current) => (current.length > nextSize.maxFlavors ? current.slice(0, nextSize.maxFlavors) : current))
    }
  }

  const toggleFlavor = (flavorProductId: string) => {
    const maxFlavors = selectedSize?.maxFlavors

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
    onClose()
  }

  const addLabel = !selectedSize
    ? "Escolha um tamanho"
    : canAdd
      ? "Adicionar ao pedido"
      : "Escolha ao menos 1 sabor"

  return (
    <ItemModal
      label="Monte o seu"
      title={category.name}
      onClose={onClose}
      footer={
        <>
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <AddButton label={addLabel} shortLabel={canAdd ? "Adicionar" : undefined} price={canAdd ? formatCents(total) : undefined} disabled={!canAdd} onClick={handleAdd} />
        </>
      }
    >
      <section className="flex flex-col gap-2" aria-label="Tamanho">
        <SectionTitle>Escolha o tamanho</SectionTitle>
        <div role="radiogroup" className="flex flex-col gap-2">
          {category.sizes.map((size) => (
            <OptionButton
              key={size.id}
              kind="radio"
              selected={sizeId === size.id}
              onClick={() => handleSelectSize(size.id)}
              trailing={formatCents(size.price)}
            >
              {size.name}
            </OptionButton>
          ))}
        </div>
      </section>

      {selectedSize && (
        <section className="flex flex-col gap-2" aria-label="Sabores">
          <SectionTitle hint={`${flavorProductIds.length}/${selectedSize.maxFlavors}`}>
            Escolha até {selectedSize.maxFlavors} {selectedSize.maxFlavors === 1 ? "sabor" : "sabores"}
          </SectionTitle>
          <div className="flex flex-col gap-2">
            {category.products.map((product) => {
              const checked = flavorProductIds.includes(product.id)
              const disabled = !checked && flavorProductIds.length >= selectedSize.maxFlavors

              return (
                <OptionButton
                  key={product.id}
                  kind="check"
                  selected={checked}
                  disabled={disabled}
                  onClick={() => toggleFlavor(product.id)}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="size-12 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <FlavorIcon className="size-5 text-on-dark-muted" strokeWidth={1.5} />
                    </span>
                  )}
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate">{product.name}</span>
                    {product.description && (
                      <span className="line-clamp-1 text-xs font-normal text-on-dark-muted">{product.description}</span>
                    )}
                  </span>
                </OptionButton>
              )
            })}
          </div>
        </section>
      )}

      {category.crusts.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Borda">
          <SectionTitle hint="Opcional">Escolha a borda</SectionTitle>
          <div role="radiogroup" className="flex flex-col gap-2">
            {category.crusts.map((crust) => (
              <OptionButton
                key={crust.id}
                kind="radio"
                selected={crustId === crust.id}
                onClick={() => setCrustId(crust.id)}
                trailing={
                  crust.priceDelta !== 0 ? `${crust.priceDelta > 0 ? "+" : ""}${formatCents(crust.priceDelta)}` : undefined
                }
              >
                {crust.name}
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
          placeholder="Ex: sem cebola, bem passado, etc."
          aria-label="Observação do item"
          className={modalTextareaClass}
        />
      </section>
    </ItemModal>
  )
}
