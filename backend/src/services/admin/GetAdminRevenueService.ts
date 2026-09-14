import prismaClient from "../../prisma/index.js";
import { formatMonthOnly, getMonthKey, getMonthRange } from "../../utils/dateRange.js";

interface GetAdminRevenueServiceProps {
    months?: number | undefined;
}

class GetAdminRevenueService {
    async execute({ months }: GetAdminRevenueServiceProps) {

        const numMonths = months ?? 12;
        const { start: rangeStart } = getMonthRange(numMonths - 1);
        const { end: rangeEnd } = getMonthRange(0);

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
            const key = getMonthKey(numMonths - 1 - i);
            result.push({ month: key, totalRevenue: revenueByMonth.get(key) ?? 0 });
        }

        return result;
    }
}

export { GetAdminRevenueService };
