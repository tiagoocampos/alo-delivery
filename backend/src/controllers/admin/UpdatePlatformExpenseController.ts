import { Request, Response } from "express";
import { UpdatePlatformExpenseService } from "../../services/admin/UpdatePlatformExpenseService.js";

class UpdatePlatformExpenseController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const { description, category, amount, date, isRecurring } = req.body;

        const updatePlatformExpenseService = new UpdatePlatformExpenseService();
        const expense = await updatePlatformExpenseService.execute({
            expenseId: id,
            description,
            category,
            amount,
            date,
            isRecurring
        });

        return res.json(expense);
    }
}

export { UpdatePlatformExpenseController };
