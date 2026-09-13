import { PlatformExpenseNotFoundError } from "../../errors/admin/AdminErrors.js";
import prismaClient from "../../prisma/index.js";

interface UpdatePlatformExpenseServiceProps {
    expenseId: string;
    description?: string | undefined;
    category?: string | undefined;
    amount?: number | undefined;
    date?: string | undefined;
    isRecurring?: boolean | undefined;
}

class UpdatePlatformExpenseService {
    async execute({ expenseId, description, category, amount, date, isRecurring }: UpdatePlatformExpenseServiceProps) {

        const expense = await prismaClient.platformExpense.findUnique({
            where: { id: expenseId }
        });

        if (!expense) {
            throw new PlatformExpenseNotFoundError();
        }

        const updated = await prismaClient.platformExpense.update({
            where: { id: expense.id },
            data: {
                ...(description === undefined ? {} : { description }),
                ...(category === undefined ? {} : { category }),
                ...(amount === undefined ? {} : { amount }),
                ...(date === undefined ? {} : { date: new Date(date) }),
                ...(isRecurring === undefined ? {} : { isRecurring }),
            }
        });

        return updated;
    }
}

export { UpdatePlatformExpenseService };
