import prismaClient from "../../prisma/index.js";
import { getDayRange } from "../../utils/dateRange.js";
import type { OrderStatus } from "../../generated/prisma/enums.js";

interface ListOrdersServiceProps {
    tenantId: string;
    status?: OrderStatus | undefined;
    date?: string | undefined;
}

class ListOrdersService {
    async execute({ tenantId, status, date }: ListOrdersServiceProps) {

        const dateRange = date ? getDayRange(date) : undefined;

        const orders = await prismaClient.order.findMany({
            where: {
                tenantId,
                ...(status ? { status } : {}),
                ...(dateRange ? { createdAt: { gte: dateRange.start, lte: dateRange.end } } : {})
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
                cancelReason: true,
                canceledBy: true,
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

        return orders;
    }
}

export { ListOrdersService };
