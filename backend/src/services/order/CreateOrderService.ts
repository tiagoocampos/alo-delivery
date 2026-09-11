import { TenantInactiveError, TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import { ProductUnavailableError } from "../../errors/order/OrderErrors.js";
import { ProductVariantNotFoundError } from "../../errors/product/ProductErrors.js";
import { CustomerTenantMismatchError } from "../../errors/customer/CustomerErrors.js";
import prismaClient from "../../prisma/index.js";
import type { PaymentMethod } from "../../generated/prisma/enums.js";

interface CreateOrderItemInput {
    productId: string;
    variantId?: string | undefined;
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
                isActive: true
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

            let priceDelta = 0;
            if (item.variantId) {
                const variant = product.variants.find(v => v.id === item.variantId);

                if (!variant) {
                    throw new ProductVariantNotFoundError();
                }

                priceDelta = variant.priceDelta;
            }

            const unitPrice = product.basePrice + priceDelta;
            subtotal += unitPrice * item.quantity;

            return {
                productId: product.id,
                variantId: item.variantId ?? null,
                quantity: item.quantity,
                unitPrice,
                note: item.note ?? null
            };
        });

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
                        }
                    }
                }
            }
        });

        return order;
    }
}

export { CreateOrderService };
