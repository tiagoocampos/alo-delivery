import { TenantInactiveError, TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import {
    InvalidCrustError,
    InvalidFlavorSelectionError,
    OrderBelowMinimumError,
    ProductUnavailableError
} from "../../errors/order/OrderErrors.js";
import { ProductVariantNotFoundError } from "../../errors/product/ProductErrors.js";
import { CustomerTenantMismatchError } from "../../errors/customer/CustomerErrors.js";
import prismaClient from "../../prisma/index.js";
import type { PaymentMethod } from "../../generated/prisma/enums.js";

interface CreateOrderItemInput {
    productId: string;
    variantId?: string | undefined;
    flavorIds?: string[] | undefined;
    crustId?: string | undefined;
    quantity: number;
    note?: string | undefined;
}

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

        const tenant = await prismaClient.tenant.findUnique({
            where: {
                slug
            },
            select: {
                id: true,
                deliveryFee: true,
                isActive: true,
                minimumOrderValue: true
            }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        if (!tenant.isActive) {
            throw new TenantInactiveError();
        }

        // Pedido público aceita tanto convidado (sem customerAuth) quanto
        // cliente logado — mas nunca vincula o pedido a um cliente de outro
        // tenant, mesmo que o token seja válido.
        if (customerAuth && customerAuth.tenantId !== tenant.id) {
            throw new CustomerTenantMismatchError();
        }

        // O preço nunca vem do cliente: buscamos os produtos ativos da loja e
        // recalculamos tudo aqui.
        const productIds = [...new Set(items.map(item => item.productId))];

        const products = await prismaClient.product.findMany({
            where: {
                id: { in: productIds },
                tenantId: tenant.id,
                isActive: true
            },
            select: {
                id: true,
                basePrice: true,
                variants: {
                    select: {
                        id: true,
                        priceDelta: true,
                        maxFlavors: true
                    }
                },
                flavors: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                crusts: {
                    select: {
                        id: true,
                        priceDelta: true
                    }
                }
            }
        });

        const productsById = new Map(products.map(product => [product.id, product]));

        let subtotal = 0;
        const orderItems = items.map(item => {
            const product = productsById.get(item.productId);

            if (!product) {
                throw new ProductUnavailableError(item.productId);
            }

            let variant: (typeof product.variants)[number] | undefined;
            if (item.variantId) {
                variant = product.variants.find(v => v.id === item.variantId);

                if (!variant) {
                    throw new ProductVariantNotFoundError();
                }
            }

            let selectedFlavorNames: string[] | undefined;
            if (product.flavors.length > 0) {
                if (!variant || variant.maxFlavors === null) {
                    throw new InvalidFlavorSelectionError("Selecione um tamanho válido para este produto");
                }

                const flavorIds = item.flavorIds ?? [];

                if (flavorIds.length < 1 || flavorIds.length > variant.maxFlavors) {
                    throw new InvalidFlavorSelectionError(
                        variant.maxFlavors === 1
                            ? "Esse tamanho permite escolher 1 sabor"
                            : `Esse tamanho permite no máximo ${variant.maxFlavors} sabores`
                    );
                }

                const flavorsById = new Map(product.flavors.map(flavor => [flavor.id, flavor]));

                selectedFlavorNames = flavorIds.map(flavorId => {
                    const flavor = flavorsById.get(flavorId);

                    if (!flavor) {
                        throw new InvalidFlavorSelectionError("Sabor inválido para este produto");
                    }

                    return flavor.name;
                });
            }

            let crust: (typeof product.crusts)[number] | undefined;
            if (item.crustId) {
                crust = product.crusts.find(c => c.id === item.crustId);

                if (!crust) {
                    throw new InvalidCrustError();
                }
            }

            const unitPrice = product.basePrice + (variant?.priceDelta ?? 0) + (crust?.priceDelta ?? 0);
            subtotal += unitPrice * item.quantity;

            return {
                productId: product.id,
                variantId: item.variantId ?? null,
                crustId: item.crustId ?? null,
                quantity: item.quantity,
                unitPrice,
                note: item.note ?? null,
                ...(selectedFlavorNames ? { selectedFlavors: selectedFlavorNames } : {})
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
                    create: orderItems
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
                        selectedFlavors: true,
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
                        crust: {
                            select: {
                                id: true,
                                name: true
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
