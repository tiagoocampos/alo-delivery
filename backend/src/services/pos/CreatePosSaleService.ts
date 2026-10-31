import {
    InvalidProductExtraError,
    ProductUnavailableError
} from "../../errors/order/OrderErrors.js";
import { ProductVariantNotFoundError } from "../../errors/product/ProductErrors.js";
import { PosPlanRequiredError, PosSaleTotalTooHighError } from "../../errors/pos/PosErrors.js";
import prismaClient from "../../prisma/index.js";
import { getEffectivePlan } from "../../utils/subscriptionPlan.js";
import { posSaleSelect } from "./posSaleSelect.js";

type PosPaymentMethod = "dinheiro" | "pix" | "cartao_debito" | "cartao_credito";

interface ProductSaleItemInput {
    type: "product";
    productId: string;
    variantId?: string | undefined;
    extraIds?: string[] | undefined;
    quantity: number;
}

interface CustomSaleItemInput {
    type: "custom";
    name: string;
    unitPrice: number;
    quantity: number;
}

interface CreatePosSaleServiceProps {
    tenantId: string;
    clientId?: string | undefined;
    paymentMethod: PosPaymentMethod;
    items: (ProductSaleItemInput | CustomSaleItemInput)[];
}

// Limite do tipo Int do Postgres (centavos) — passando disso o INSERT estouraria.
const MAX_TOTAL = 2_000_000_000;

class CreatePosSaleService {
    async execute({ tenantId, clientId, paymentMethod, items }: CreatePosSaleServiceProps) {

        const subscription = await prismaClient.subscription.findUnique({
            where: { tenantId },
            select: { status: true, monthlyPrice: true, startedAt: true }
        });

        if (getEffectivePlan(subscription) === "basico") {
            throw new PosPlanRequiredError();
        }

        // Idempotência: reenvio da mesma venda (duplo clique, falha de rede)
        // devolve a que já existe em vez de duplicar.
        if (clientId) {
            const existing = await this.findByClientId(tenantId, clientId);

            if (existing) {
                return { sale: existing, created: false };
            }
        }

        const productItems = items.filter((item): item is ProductSaleItemInput => item.type === "product");
        const productIds = [...new Set(productItems.map(item => item.productId))];

        // Busca em lote (sem N+1). "delivery" puro não é vendável no balcão.
        const products = productIds.length === 0 ? [] : await prismaClient.product.findMany({
            where: {
                id: { in: productIds },
                tenantId,
                isActive: true,
                availability: { in: ["ambos", "balcao"] }
            },
            select: {
                id: true,
                name: true,
                basePrice: true,
                category: {
                    select: {
                        _count: {
                            select: { sizes: true }
                        }
                    }
                },
                variants: {
                    select: {
                        id: true,
                        name: true,
                        priceDelta: true
                    }
                },
                extras: {
                    select: {
                        id: true,
                        name: true,
                        price: true
                    }
                }
            }
        });

        const productsById = new Map(products.map(product => [product.id, product]));

        let subtotal = 0;

        const orderItemsData = items.map(item => {
            if (item.type === "custom") {
                subtotal += item.unitPrice * item.quantity;

                return {
                    productId: null,
                    name: item.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                };
            }

            const product = productsById.get(item.productId);

            if (!product) {
                throw new ProductUnavailableError(item.productId);
            }

            // Sabor (sem preço próprio) ou categoria com tamanhos é o fluxo de
            // pizza, fora do escopo do PDV — o lojista usa item avulso.
            if (product.basePrice === null || product.category._count.sizes > 0) {
                throw new ProductUnavailableError(
                    item.productId,
                    `O produto "${product.name}" é de uma categoria com tamanhos e não pode ser vendido no PDV — lance como item avulso`
                );
            }

            let priceDelta = 0;
            let variantName: string | undefined;
            if (item.variantId) {
                const variant = product.variants.find(v => v.id === item.variantId);

                if (!variant) {
                    throw new ProductVariantNotFoundError();
                }

                priceDelta = variant.priceDelta;
                variantName = variant.name;
            }

            const extras = (item.extraIds ?? []).map(extraId => {
                const extra = product.extras.find(e => e.id === extraId);

                if (!extra) {
                    throw new InvalidProductExtraError();
                }

                return { productExtraId: extra.id, name: extra.name, price: extra.price };
            });
            const extrasTotal = extras.reduce((sum, extra) => sum + extra.price, 0);

            const unitPrice = product.basePrice + priceDelta + extrasTotal;
            subtotal += unitPrice * item.quantity;

            return {
                productId: product.id,
                variantId: item.variantId ?? null,
                name: variantName ? `${product.name} - ${variantName}` : product.name,
                quantity: item.quantity,
                unitPrice,
                extras: {
                    create: extras
                }
            };
        });

        if (subtotal > MAX_TOTAL) {
            throw new PosSaleTotalTooHighError();
        }

        // Sem minimumOrderValue, fidelidade, push ou máquina de estados:
        // a venda de balcão já nasce "entregue".
        try {
            const sale = await prismaClient.order.create({
                data: {
                    tenantId,
                    origin: "balcao",
                    status: "entregue",
                    customerName: "Balcão",
                    customerPhone: null,
                    address: null,
                    paymentMethod,
                    clientId: clientId ?? null,
                    subtotal,
                    deliveryFee: 0,
                    total: subtotal,
                    items: {
                        create: orderItemsData
                    }
                },
                select: posSaleSelect
            });

            return { sale, created: true };
        } catch (error) {
            // Duas requisições com o mesmo clientId em paralelo: a segunda
            // bate no unique (tenantId, clientId) e devolve a venda da primeira.
            if (clientId && (error as { code?: string }).code === "P2002") {
                const existing = await this.findByClientId(tenantId, clientId);

                if (existing) {
                    return { sale: existing, created: false };
                }
            }

            throw error;
        }
    }

    private findByClientId(tenantId: string, clientId: string) {
        return prismaClient.order.findFirst({
            where: {
                tenantId,
                clientId,
                origin: "balcao"
            },
            select: posSaleSelect
        });
    }
}

export { CreatePosSaleService };
