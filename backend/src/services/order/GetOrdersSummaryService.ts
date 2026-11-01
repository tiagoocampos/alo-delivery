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
            // Online: dia pelo createdAt. Balcão: dia pelo closedAt, e só contas já
            // fechadas ou canceladas (mesa "aberta" não é faturamento nem pedido).
            where: {
                tenantId,
                OR: [
                    { origin: "online", createdAt: { gte: start, lte: end } },
                    {
                        origin: "balcao",
                        status: { in: ["entregue", "cancelado"] },
                        closedAt: { gte: start, lte: end }
                    }
                ]
            },
            select: {
                status: true,
                total: true,
                origin: true
            }
        });

        const totalOrdersIncludingCancelled = orders.length;
        const validOrders = orders.filter(order => order.status !== "cancelado");
        const totalOrders = validOrders.length;
        const totalRevenue = validOrders.reduce((sum, order) => sum + order.total, 0);
        const onlineRevenue = validOrders
            .filter(order => order.origin === "online")
            .reduce((sum, order) => sum + order.total, 0);
        const balcaoRevenue = totalRevenue - onlineRevenue;
        const averageTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

        return {
            totalOrders,
            totalRevenue,
            averageTicket,
            totalOrdersIncludingCancelled,
            onlineRevenue,
            balcaoRevenue
        };
    }
}

export { GetOrdersSummaryService };
