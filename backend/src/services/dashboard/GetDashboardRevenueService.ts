import prismaClient from "../../prisma/index.js";
import { formatDateOnly, getDayRange, shiftDateKey } from "../../utils/dateRange.js";

interface GetDashboardRevenueServiceProps {
    tenantId: string;
    days?: number | undefined;
}

class GetDashboardRevenueService {
    async execute({ tenantId, days }: GetDashboardRevenueServiceProps) {

        const numDays = days ?? 30;
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
                createdAt: true,
                total: true
            }
        });

        const byDate = new Map<string, { totalRevenue: number; totalOrders: number }>();
        for (const order of orders) {
            const key = formatDateOnly(order.createdAt);
            const entry = byDate.get(key) ?? { totalRevenue: 0, totalOrders: 0 };
            entry.totalRevenue += order.total;
            entry.totalOrders += 1;
            byDate.set(key, entry);
        }

        const result: { date: string; totalRevenue: number; totalOrders: number }[] = [];
        for (let i = 0; i < numDays; i++) {
            const key = shiftDateKey(startKey, i);
            const entry = byDate.get(key) ?? { totalRevenue: 0, totalOrders: 0 };
            result.push({ date: key, totalRevenue: entry.totalRevenue, totalOrders: entry.totalOrders });
        }

        return result;
    }
}

export { GetDashboardRevenueService };
