import prismaClient from "../../prisma/index.js";

interface CreatePlatformExpenseServiceProps {
    description: string;
    category?: string | undefined;
    amount: number;
    date: string;
    isRecurring?: boolean | undefined;
}

class CreatePlatformExpenseService {
    async execute({ description, category, amount, date, isRecurring }: CreatePlatformExpenseServiceProps) {

        const expense = await prismaClient.platformExpense.create({
            data: {
                description,
                category: category ?? null,
                amount,
                date: new Date(date),
                isRecurring: isRecurring ?? false
            }
        });

        return expense;
    }
}

export { CreatePlatformExpenseService };
