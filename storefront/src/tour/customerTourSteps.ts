import { formatCents } from "@/lib/money"
import { toInternationalPhone } from "@/lib/phone"
import { getOrderStatusLabel } from "@/lib/orderStatus"
import type { Category, Tenant } from "@/types"

// Todo o texto do tutorial do cliente fica aqui. **trecho** vira negrito.

export interface CustomerTourContext {
  tenant: Tenant
  categories: Category[]
  isBasico: boolean
  isAuthenticated: boolean
  canInstall: boolean
  pushSupported: boolean
}

export type IllustrationId = "montar" | "finalizar" | "acompanhar"

export interface CustomerTourStep {
  id: string
  title: string
  body: string
  list?: string[]
  // Elementos reais a destacar (união das áreas). Vazio/ausente ou invisível =
  // balão centralizado.
  targets?: () => (Element | null)[]
  // Mini ilustração estática dentro do balão (nada é clicável nem altera dados).
  illustration?: { id: IllustrationId; methods?: string[]; stages?: string[] }
}

const isCustomizable = (product: Category["products"][number]) =>
  (product.ingredients?.length ?? 0) > 0 || product.extras.length > 0 || product.variants.length > 0

function regularProducts(categories: Category[]) {
  return categories.filter((category) => category.sizes.length === 0).flatMap((category) => category.products)
}

// Prefere o cartão com "+ Montar"; se não houver, o primeiro cartão.
function productCardTarget(): (Element | null)[] {
  return [
    document.querySelector('[data-product-card][data-customizable="true"]') ??
      document.querySelector("[data-product-card]"),
  ]
}

export function buildCustomerSteps(ctx: CustomerTourContext): CustomerTourStep[] {
  const { tenant, categories, isBasico, isAuthenticated, canInstall, pushSupported } = ctx
  const products = regularProducts(categories)
  const hasCustomizable = products.some(isCustomizable)
  const hasAddable = products.some((product) => !isCustomizable(product))
  const steps: CustomerTourStep[] = []

  steps.push({
    id: "boas-vindas",
    title: "Pedir é rápido!",
    body: "Em poucos passos você aprende a escolher, montar e enviar seu pedido.",
  })

  steps.push({
    id: "busca",
    title: "Encontre o que quer",
    body: "Procure pelo nome ou toque nas categorias para ir direto ao que você quer.",
    targets: () => [document.querySelector('[data-tour="busca"]'), document.querySelector('[data-tour="categorias"]')],
  })

  const productHow = [
    "Toque no produto para ver os detalhes.",
    hasAddable ? "Com **+ Adicionar**, ele entra direto no pedido." : "",
    hasCustomizable ? "Com **+ Montar**, você escolhe como quer." : "",
  ]
    .filter(Boolean)
    .join(" ")

  steps.push({
    id: "produto",
    title: "Escolha o produto",
    body: productHow,
    targets: productCardTarget,
  })

  if (hasCustomizable) {
    steps.push({
      id: "montar",
      title: "Monte do seu jeito",
      body: "Os ingredientes já vêm marcados: **toque para tirar** o que não quer. Depois escolha adicionais, se quiser. O total aparece ao vivo.",
      illustration: { id: "montar" },
    })
  }

  const hasContact = toInternationalPhone(tenant.phone) !== null
  steps.push({
    id: "valor",
    title: "Acompanhe o valor",
    body: [
      "Aqui embaixo fica o valor do seu pedido. Toque em **Pedido** para revisar os itens e finalizar.",
      hasContact ? "Ficou com dúvida? Ligue ou chame no WhatsApp." : "",
    ]
      .filter(Boolean)
      .join(" "),
    targets: () => [document.querySelector('[data-tour="barra-pedido"]')],
  })

  // Só as formas que o checkout realmente oferece: Pix (se a loja tem chave) e na entrega.
  const methods = [tenant.pixKey ? "Pix" : null, "Pagamento na entrega"].filter((m): m is string => m !== null)
  steps.push({
    id: "finalizar",
    title: "Finalize",
    body: [
      `Informe seus dados e escolha como pagar: **${methods.join(" ou ")}**. Depois é só confirmar.`,
      tenant.minimumOrderValue > 0 ? `Pedido mínimo: ${formatCents(tenant.minimumOrderValue)}.` : "",
      tenant.deliveryFee > 0 ? `Taxa de entrega: ${formatCents(tenant.deliveryFee)}.` : "Entrega grátis.",
    ]
      .filter(Boolean)
      .join(" "),
    illustration: { id: "finalizar", methods },
  })

  // Plano básico só mostra "Recebido" para o cliente (ver lib/orderStatus).
  const stages = isBasico
    ? [getOrderStatusLabel("novo")]
    : (["novo", "preparo", "transporte", "entregue"] as const).map(getOrderStatusLabel)
  steps.push({
    id: "acompanhar",
    title: "Acompanhe o pedido",
    body: isBasico
      ? "Depois de enviar, a loja recebe o seu pedido e confirma com você."
      : ["Depois de enviar, você acompanha cada etapa do pedido.", pushSupported ? "Ative os avisos para ser notificado a cada etapa." : ""]
          .filter(Boolean)
          .join(" "),
    illustration: { id: "acompanhar", stages },
  })

  const tips = [
    products.length > 0 ? "Toque no **coração** dos produtos para favoritar e achar de novo mais rápido." : "",
    !isAuthenticated ? "Crie uma **conta** para guardar seus endereços e ver seus pedidos." : "",
    !isBasico ? "Cada pedido entregue soma pontos no **programa de fidelidade** da loja (veja no menu)." : "",
    canInstall && !isBasico ? "**Instale a loja** no celular como app para pedir com um toque." : "",
  ].filter(Boolean)

  // Sem nenhuma dica real para dar, o passo some.
  if (tips.length > 0) {
    steps.push({ id: "dicas", title: "Dicas", body: "Alguns atalhos que ajudam:", list: tips })
  }

  steps.push({
    id: "final",
    title: "Pronto, bom apetite!",
    body: "Se precisar rever, toque em **Como pedir?** no menu.",
  })

  return steps
}
