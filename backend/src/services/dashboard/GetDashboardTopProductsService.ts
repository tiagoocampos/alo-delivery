import prismaClient from "../../prisma/index.js";
import { formatDateOnly, getDayRange, shiftDateKey } from "../../utils/dateRange.js";

interface GetDashboardTopProductsServiceProps {
    tenantId: string;
    days?: number | undefined;
    limit?: number | undefined;
}

class GetDashboardTopProductsService {
    async execute({ tenantId, days, limit }: GetDashboardTopProductsServiceProps) {

        const numDays = days ?? 30;
        const limitCount = limit ?? 5;

        const todayKey = formatDateOnly(new Date());
        const startKey = shiftDateKey(todayKey, -(numDays - 1));
        const { end: rangeEnd } = getDayRange(todayKey);
        const { start: rangeStart } = getDayRange(startKey);

        const orders = await prismaClient.order.findMany({
            where: {
                tenantId,
                status: { not: "cancelado" },
                createdAt: { gte: rangeStart, lte: rangeEnd }
            },
            select: {
                items: {
                    select: {
                        quantity: true,
                        productId: true,
                        product: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        flavors: {
                            select: {
                                productId: true,
                                productName: true
                            }
                        }
                    }
                }
            }
        });

        const totalsByProductId = new Map<string, { productName: string; totalQuantity: number }>();

        const addQuantity = (productId: string, productName: string, quantity: number) => {
            const entry = totalsByProductId.get(productId) ?? { productName, totalQuantity: 0 };
            entry.totalQuantity += quantity;
            totalsByProductId.set(productId, entry);
        };

        for (const order of orders) {
            for (const item of order.items) {
                // Item normal: a quantidade conta pro produto direto.
                if (item.productId && item.product) {
                    addQuantity(item.productId, item.product.name, item.quantity);
                }

                // Item "tamanho + sabores": cada sabor escolhido conta como
                // pedido `item.quantity` vezes (a quantidade da pizza inteira).
                for (const flavor of item.flavors) {
                    addQuantity(flavor.productId, flavor.productName, item.quantity);
                }
            }
        }

        return [...totalsByProductId.entries()]
            .map(([productId, { productName, totalQuantity }]) => ({ productId, productName, totalQuantity }))
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, limitCount);
    }
}

export { GetDashboardTopProductsService };
