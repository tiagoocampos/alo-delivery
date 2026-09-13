import prismaClient from "../../prisma/index.js";
import { getMonthRange } from "../../utils/dateRange.js";

class GetAdminSummaryService {
    async execute() {

        const { start, end } = getMonthRange(0);

        const [payments, expenses, activeSubscriptions] = await Promise.all([
            prismaClient.platformPayment.findMany({
                where: { paidAt: { gte: start, lte: end } },
                select: { amount: true }
            }),
            prismaClient.platformExpense.findMany({
                where: { date: { gte: start, lte: end } },
                select: { amount: true }
            }),
            prismaClient.subscription.findMany({
                where: { status: "active" },
                select: { monthlyPrice: true }
            })
        ]);

        const totalRevenueThisMonth = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalExpensesThisMonth = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const netProfitThisMonth = totalRevenueThisMonth - totalExpensesThisMonth;
        const activeTenants = activeSubscriptions.length;
        const mrr = activeSubscriptions.reduce((sum, subscription) => sum + subscription.monthlyPrice, 0);

        return {
            totalRevenueThisMonth,
            totalExpensesThisMonth,
            netProfitThisMonth,
            activeTenants,
            mrr
        };
    }
}

export { GetAdminSummaryService };
