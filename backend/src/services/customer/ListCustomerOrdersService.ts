import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import { CustomerTenantMismatchError } from "../../errors/customer/CustomerErrors.js";
import prismaClient from "../../prisma/index.js";

interface ListCustomerOrdersServiceProps {
    slug: string;
    customerId: string;
    customerTenantId: string;
}

class ListCustomerOrdersService {
    // Dupla checagem por design: o cliente só vê pedido dele (customerId do
    // token) e só dentro da loja resolvida pelo slug da URL (tenantId).
    async execute({ slug, customerId, customerTenantId }: ListCustomerOrdersServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        if (customerTenantId !== tenant.id) {
            throw new CustomerTenantMismatchError();
        }

        const orders = await prismaClient.order.findMany({
            where: {
                tenantId: tenant.id,
                customerId
            },
            orderBy: {
                createdAt: "desc"
            },
            select: {
                id: true,
                customerName: true,
                customerPhone: true,
                address: true,
                status: true,
                subtotal: true,
                deliveryFee: true,
                total: true,
                paymentMethod: true,
                createdAt: true,
                updatedAt: true,
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
                        }
                    }
                }
            }
        });

        return orders;
    }
}

export { ListCustomerOrdersService };
