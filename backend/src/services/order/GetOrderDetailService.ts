import { OrderNotFoundError } from "../../errors/order/OrderErrors.js";
import prismaClient from "../../prisma/index.js";

interface GetOrderDetailServiceProps {
    tenantId: string;
    orderId: string;
}

class GetOrderDetailService {
    async execute({ tenantId, orderId }: GetOrderDetailServiceProps) {

        const order = await prismaClient.order.findFirst({
            where: {
                id: orderId,
                tenantId
            },
            select: {
                id: true,
                tenantId: true,
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
                                name: true,
                                imageUrl: true
                            }
                        },
                        variant: {
                            select: {
                                id: true,
                                name: true,
                                priceDelta: true
                            }
                        }
                    }
                }
            }
        });

        if (!order) {
            throw new OrderNotFoundError();
        }

        return order;
    }
}

export { GetOrderDetailService };
