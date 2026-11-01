import {
    InvalidProductExtraError,
    ProductUnavailableError
} from "../../errors/order/OrderErrors.js";
import { ProductVariantNotFoundError } from "../../errors/product/ProductErrors.js";
import prismaClient from "../../prisma/index.js";

export interface ProductPosItemInput {
    type: "product";
    productId: string;
    variantId?: string | undefined;
    extraIds?: string[] | undefined;
    quantity: number;
}

export interface CustomPosItemInput {
    type: "custom";
    name: string;
    unitPrice: number;
    quantity: number;
}

export type PosItemInput = ProductPosItemInput | CustomPosItemInput;

// Item pronto pra gravar: nome, preço e extras já congelados.
export interface BuiltPosItem {
    productId: string | null;
    variantId: string | null;
    name: string;
    quantity: number;
    unitPrice: number;
    extras: { productExtraId: string; name: string; price: number }[];
}

// Regra única de montagem de item do PDV, usada pela venda rápida e pela
// adição de item à mesa. O preço de produto do cadastro é calculado aqui
// (nunca vem do cliente) e fica congelado no momento em que o item entra.
export async function buildPosItems(tenantId: string, items: PosItemInput[]): Promise<BuiltPosItem[]> {

    const productItems = items.filter((item): item is ProductPosItemInput => item.type === "product");
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

    return items.map((item): BuiltPosItem => {
        if (item.type === "custom") {
            return {
                productId: null,
                variantId: null,
                name: item.name.trim(),
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                extras: []
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

        return {
            productId: product.id,
            variantId: item.variantId ?? null,
            name: variantName ? `${product.name} - ${variantName}` : product.name,
            quantity: item.quantity,
            unitPrice: product.basePrice + priceDelta + extrasTotal,
            extras
        };
    });
}

export function sumPosItems(items: { unitPrice: number; quantity: number }[]): number {
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

// Formato de criação aninhada do Prisma (OrderItem + OrderItemExtra).
export function toOrderItemCreate(item: BuiltPosItem) {
    return {
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        extras: {
            create: item.extras
        }
    };
}
