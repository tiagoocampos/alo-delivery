import { Request, Response } from "express";
import { ListPosSalesService } from "../../services/pos/ListPosSalesService.js";

class ListPosSalesController {
    async handle(req: Request, res: Response) {
        const date = req.query.date as string | undefined;

        const listPosSalesService = new ListPosSalesService();
        const result = await listPosSalesService.execute({
            tenantId: req.auth.tenantId!,
            date
        });

        return res.json(result);
    }
}

export { ListPosSalesController };
