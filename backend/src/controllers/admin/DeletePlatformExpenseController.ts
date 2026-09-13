import { Request, Response } from "express";
import { DeletePlatformExpenseService } from "../../services/admin/DeletePlatformExpenseService.js";

class DeletePlatformExpenseController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };

        const deletePlatformExpenseService = new DeletePlatformExpenseService();
        const expense = await deletePlatformExpenseService.execute({ expenseId: id });

        return res.json(expense);
    }
}

export { DeletePlatformExpenseController };
