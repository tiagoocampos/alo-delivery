import { Request, Response } from "express";
import { CreatePlatformExpenseService } from "../../services/admin/CreatePlatformExpenseService.js";

class CreatePlatformExpenseController {
    async handle(req: Request, res: Response) {
        const { description, category, amount, date, isRecurring } = req.body;

        const createPlatformExpenseService = new CreatePlatformExpenseService();
        const expense = await createPlatformExpenseService.execute({
            description,
            category,
            amount,
            date,
            isRecurring
        });

        return res.status(201).json(expense);
    }
}

export { CreatePlatformExpenseController };
