import prismaClient from "../../prisma/index.js";
import type { OrderStatus } from "../../generated/prisma/enums.js";

interface ListOrdersServiceProps {
    tenantId: string;
    status?: OrderStatus | undefined;
}

class ListOrdersService {
    async execute({ tenantId, status }: ListOrdersServiceProps) {

        const orders = await prismaClient.order.findMany({
            where: {
                tenantId,
                ...(status ? { status } : {})
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
                        }
                    }
                }
            }
        });

        return orders;
    }
}

export { ListOrdersService };
