import prismaClient from "../../prisma/index.js";
import { getMonthRange } from "../../utils/dateRange.js";

interface GetDashboardSummaryServiceProps {
    tenantId: string;
}

interface MonthSummary {
    totalRevenue: number;
    totalOrders: number;
}

class GetDashboardSummaryService {
    async execute({ tenantId }: GetDashboardSummaryServiceProps) {

        const now = new Date();
        const currentRange = getMonthRange(0, now);
        const previousRange = getMonthRange(1, now);

        const summarizeMonth = async (start: Date, end: Date): Promise<MonthSummary> => {
            const orders = await prismaClient.order.findMany({
                where: {
                    tenantId,
                    status: { not: "cancelado" },
                    createdAt: { gte: start, lte: end }
                },
                select: {
                    total: true
                }
            });

            return {
                totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
                totalOrders: orders.length
            };
        };

        const [currentMonth, previousMonth] = await Promise.all([
            summarizeMonth(currentRange.start, currentRange.end),
            summarizeMonth(previousRange.start, previousRange.end)
        ]);

        return { currentMonth, previousMonth };
    }
}

export { GetDashboardSummaryService };
