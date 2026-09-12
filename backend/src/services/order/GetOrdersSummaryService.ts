import prismaClient from "../../prisma/index.js";
import { getDayRange } from "../../utils/dateRange.js";

interface GetOrdersSummaryServiceProps {
    tenantId: string;
    date?: string | undefined;
}

class GetOrdersSummaryService {
    async execute({ tenantId, date }: GetOrdersSummaryServiceProps) {

        const { start, end } = getDayRange(date);

        const orders = await prismaClient.order.findMany({
            where: {
                tenantId,
                createdAt: { gte: start, lte: end }
            },
            select: {
                status: true,
                total: true
            }
        });

        const totalOrdersIncludingCancelled = orders.length;
        const validOrders = orders.filter(order => order.status !== "cancelado");
        const totalOrders = validOrders.length;
        const totalRevenue = validOrders.reduce((sum, order) => sum + order.total, 0);
        const averageTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

        return {
            totalOrders,
            totalRevenue,
            averageTicket,
            totalOrdersIncludingCancelled
        };
    }
}

export { GetOrdersSummaryService };
