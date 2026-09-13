import prismaClient from "../../prisma/index.js";
import { formatMonthOnly } from "../../utils/dateRange.js";

interface GetAdminRevenueServiceProps {
    months?: number | undefined;
}

class GetAdminRevenueService {
    async execute({ months }: GetAdminRevenueServiceProps) {

        const numMonths = months ?? 12;
        const now = new Date();
        const rangeStart = new Date(now.getFullYear(), now.getMonth() - (numMonths - 1), 1, 0, 0, 0, 0);
        const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const payments = await prismaClient.platformPayment.findMany({
            where: {
                paidAt: { gte: rangeStart, lte: rangeEnd }
            },
            select: {
                paidAt: true,
                amount: true
            }
        });

        const revenueByMonth = new Map<string, number>();
        for (const payment of payments) {
            const key = formatMonthOnly(payment.paidAt);
            revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + payment.amount);
        }

        const result: { month: string; totalRevenue: number }[] = [];
        for (let i = 0; i < numMonths; i++) {
            const month = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + i, 1);
            const key = formatMonthOnly(month);
            result.push({ month: key, totalRevenue: revenueByMonth.get(key) ?? 0 });
        }

        return result;
    }
}

export { GetAdminRevenueService };
