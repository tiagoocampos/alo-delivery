import { TenantInactiveError } from "../../errors/tenant/TenantErrors.js";
import { resolveTenantOrThrow } from "../tenant/resolveTenantOrThrow.js";
import {
    InvalidCategoryCrustError,
    InvalidCategorySizeError,
    InvalidFlavorSelectionError,
    InvalidProductExtraError,
    OrderBelowMinimumError,
    ProductUnavailableError
} from "../../errors/order/OrderErrors.js";
import { ProductVariantNotFoundError } from "../../errors/product/ProductErrors.js";
import { CustomerTenantMismatchError } from "../../errors/customer/CustomerErrors.js";
import prismaClient from "../../prisma/index.js";
import type { PaymentMethod } from "../../generated/prisma/enums.js";

interface NormalOrderItemInput {
    productId: string;
    variantId?: string | undefined;
    extraIds?: string[] | undefined;
    quantity: number;
    note?: string | undefined;
}

interface SizeOrderItemInput {
    categorySizeId: string;
    flavorProductIds: string[];
    categoryCrustId?: string | undefined;
    quantity: number;
    note?: string | undefined;
}

type CreateOrderItemInput = NormalOrderItemInput | SizeOrderItemInput;

interface CreateOrderServiceProps {
    slug: string;
    customerName: string;
    customerPhone: string;
    address: string;
    paymentMethod: PaymentMethod;
    items: CreateOrderItemInput[];
    customerAuth?: { customerId: string; tenantId: string } | undefined;
}

class CreateOrderService {
    async execute({
        slug,
        customerName,
        customerPhone,
        address,
        paymentMethod,
        items,
        customerAuth
    }: CreateOrderServiceProps) {

        const tenant = await resolveTenantOrThrow({ slug });

        if (!tenant.isActive) {
            throw new TenantInactiveError();
        }

        // Pedido público aceita tanto convidado (sem customerAuth) quanto
        // cliente logado — mas nunca vincula o pedido a um cliente de outro
        // tenant, mesmo que o token seja válido.
        if (customerAuth && customerAuth.tenantId !== tenant.id) {
            throw new CustomerTenantMismatchError();
        }

        const normalItems = items.filter((item): item is NormalOrderItemInput => "productId" in item);
        const sizeItems = items.filter((item): item is SizeOrderItemInput => "categorySizeId" in item);

        // O preço nunca vem do cliente: buscamos tudo que os itens referenciam
        // (produtos, tamanhos, sabores, bordas) e recalculamos aqui.
        const normalProductIds = [...new Set(normalItems.map(item => item.productId))];
        const categorySizeIds = [...new Set(sizeItems.map(item => item.categorySizeId))];
        const flavorProductIds = [...new Set(sizeItems.flatMap(item => item.flavorProductIds))];
        const categoryCrustIds = [...new Set(sizeItems.flatMap(item => item.categoryCrustId ? [item.categoryCrustId] : []))];

        const products = await prismaClient.product.findMany({
            where: {
                id: { in: normalProductIds },
                tenantId: tenant.id,
                isActive: true
            },
            select: {
                id: true,
                basePrice: true,
                variants: {
                    select: {
                        id: true,
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

        const categorySizes = await prismaClient.categorySize.findMany({
            where: {
                id: { in: categorySizeIds }
            },
            select: {
                id: true,
                price: true,
                maxFlavors: true,
                categoryId: true,
                category: {
                    select: {
                        tenantId: true,
                        name: true
                    }
                }
            }
        });

        const flavorProducts = await prismaClient.product.findMany({
            where: {
                id: { in: flavorProductIds },
                isActive: true
            },
            select: {
                id: true,
                name: true,
                categoryId: true
            }
        });

        const categoryCrusts = await prismaClient.categoryCrust.findMany({
            where: {
                id: { in: categoryCrustIds }
            },
            select: {
                id: true,
                priceDelta: true,
                categoryId: true
            }
        });

        const productsById = new Map(products.map(product => [product.id, product]));
        const categorySizesById = new Map(categorySizes.map(size => [size.id, size]));
        const flavorProductsById = new Map(flavorProducts.map(product => [product.id, product]));
        const categoryCrustsById = new Map(categoryCrusts.map(crust => [crust.id, crust]));

        let subtotal = 0;

        const orderItemsData = items.map(item => {
            if ("productId" in item) {
                const product = productsById.get(item.productId);

                if (!product) {
                    throw new ProductUnavailableError(item.productId);
                }

                // Um "sabor" (sem preço próprio) não pode ser pedido diretamente
                // como item normal — só faz sentido dentro do formato tamanho+sabores.
                if (product.basePrice === null) {
                    throw new ProductUnavailableError(item.productId);
                }

                let priceDelta = 0;
                if (item.variantId) {
                    const variant = product.variants.find(v => v.id === item.variantId);

                    if (!variant) {
                        throw new ProductVariantNotFoundError();
                    }

                    priceDelta = variant.priceDelta;
                }

                const extraIds = item.extraIds ?? [];
                const extras = extraIds.map(extraId => {
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
                    categorySizeId: null,
                    categoryCrustId: null,
                    quantity: item.quantity,
                    unitPrice,
                    note: item.note ?? null,
                    extras: {
                        create: extras
                    }
                };
            }

            const categorySize = categorySizesById.get(item.categorySizeId);

            if (!categorySize || categorySize.category.tenantId !== tenant.id) {
                throw new InvalidCategorySizeError();
            }

            if (item.flavorProductIds.length < 1 || item.flavorProductIds.length > categorySize.maxFlavors) {
                throw new InvalidFlavorSelectionError(
                    categorySize.maxFlavors === 1
                        ? "Esse tamanho permite escolher 1 sabor"
                        : `Esse tamanho permite no máximo ${categorySize.maxFlavors} sabores`
                );
            }

            const flavors = item.flavorProductIds.map(flavorProductId => {
                const flavor = flavorProductsById.get(flavorProductId);

                if (!flavor || flavor.categoryId !== categorySize.categoryId) {
                    throw new InvalidFlavorSelectionError("Sabor inválido para este produto");
                }

                return { productId: flavor.id, productName: flavor.name };
            });

            let crust: { id: string; priceDelta: number } | undefined;
            if (item.categoryCrustId) {
                const found = categoryCrustsById.get(item.categoryCrustId);

                if (!found || found.categoryId !== categorySize.categoryId) {
                    throw new InvalidCategoryCrustError();
                }

                crust = found;
            }

            const unitPrice = categorySize.price + (crust?.priceDelta ?? 0);
            subtotal += unitPrice * item.quantity;

            return {
                productId: null,
                variantId: null,
                categorySizeId: categorySize.id,
                categoryCrustId: crust?.id ?? null,
                quantity: item.quantity,
                unitPrice,
                note: item.note ?? null,
                flavors: {
                    create: flavors
                }
            };
        });

        if (subtotal < tenant.minimumOrderValue) {
            throw new OrderBelowMinimumError(tenant.minimumOrderValue);
        }

        const deliveryFee = tenant.deliveryFee;
        const total = subtotal + deliveryFee;

        const order = await prismaClient.order.create({
            data: {
                tenantId: tenant.id,
                customerId: customerAuth?.customerId ?? null,
                customerName,
                customerPhone,
                address,
                paymentMethod,
                subtotal,
                deliveryFee,
                total,
                items: {
                    create: orderItemsData
                }
            },
            select: {
                id: true,
                tenantId: true,
                customerId: true,
                customerName: true,
                customerPhone: true,
                address: true,
                status: true,
                subtotal: true,
                deliveryFee: true,
                total: true,
                paymentMethod: true,
                createdAt: true,
                items: {
                    select: {
                        id: true,
                        quantity: true,
                        unitPrice: true,
                        note: true,
                        product: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        variant: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        categorySize: {
                            select: {
                                id: true,
                                name: true,
                                category: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        },
                        categoryCrust: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        flavors: {
                            select: {
                                id: true,
                                productId: true,
                                productName: true
                            }
                        },
                        extras: {
                            select: {
                                id: true,
                                productExtraId: true,
                                name: true,
                                price: true
                            }
                        }
                    }
                }
            }
        });

        return order;
    }
}

export { CreateOrderService };
