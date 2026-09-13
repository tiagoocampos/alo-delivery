import prismaClient from "../../prisma/index.js";
import { getMonthRangeFromString } from "../../utils/dateRange.js";

interface ListPlatformExpensesServiceProps {
    month?: string | undefined;
}

class ListPlatformExpensesService {
    async execute({ month }: ListPlatformExpensesServiceProps) {

        const monthRange = month ? getMonthRangeFromString(month) : undefined;

        const expenses = await prismaClient.platformExpense.findMany({
            where: monthRange ? { date: { gte: monthRange.start, lte: monthRange.end } } : {},
            orderBy: {
                date: "desc"
            }
        });

        return expenses;
    }
}

export { ListPlatformExpensesService };
