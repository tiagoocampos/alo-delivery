import { PlatformExpenseNotFoundError } from "../../errors/admin/AdminErrors.js";
import prismaClient from "../../prisma/index.js";

interface DeletePlatformExpenseServiceProps {
    expenseId: string;
}

class DeletePlatformExpenseService {
    async execute({ expenseId }: DeletePlatformExpenseServiceProps) {

        const expense = await prismaClient.platformExpense.findUnique({
            where: { id: expenseId },
            select: { id: true }
        });

        if (!expense) {
            throw new PlatformExpenseNotFoundError();
        }

        await prismaClient.platformExpense.delete({
            where: { id: expense.id }
        });

        return { id: expense.id };
    }
}

export { DeletePlatformExpenseService };
