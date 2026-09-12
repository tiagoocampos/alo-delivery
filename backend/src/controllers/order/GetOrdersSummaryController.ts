import { Request, Response } from "express";
import { GetOrdersSummaryService } from "../../services/order/GetOrdersSummaryService.js";

class GetOrdersSummaryController {
    async handle(req: Request, res: Response) {
        const date = req.query.date as string | undefined;

        const getOrdersSummaryService = new GetOrdersSummaryService();
        const summary = await getOrdersSummaryService.execute({
            tenantId: req.auth.tenantId!,
            date
        });

        return res.json(summary);
    }
}

export { GetOrdersSummaryController };
