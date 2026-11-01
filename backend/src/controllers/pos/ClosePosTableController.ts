import { Request, Response } from "express";
import { ClosePosTableService } from "../../services/pos/ClosePosTableService.js";

class ClosePosTableController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;
        const { paymentMethod } = req.body;

        const closePosTableService = new ClosePosTableService();
        const table = await closePosTableService.execute({
            tenantId: req.auth.tenantId!,
            tableId: id,
            paymentMethod
        });

        return res.json(table);
    }
}

export { ClosePosTableController };
