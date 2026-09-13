import { Request, Response } from "express";
import { ListPlatformExpensesService } from "../../services/admin/ListPlatformExpensesService.js";

class ListPlatformExpensesController {
    async handle(req: Request, res: Response) {
        const month = req.query.month as string | undefined;

        const listPlatformExpensesService = new ListPlatformExpensesService();
        const expenses = await listPlatformExpensesService.execute({ month });

        return res.json(expenses);
    }
}

export { ListPlatformExpensesController };
