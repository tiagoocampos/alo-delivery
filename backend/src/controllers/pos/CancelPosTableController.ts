import { Request, Response } from "express";
import { CancelPosTableService } from "../../services/pos/CancelPosTableService.js";

class CancelPosTableController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;
        const { reason } = req.body;

        const cancelPosTableService = new CancelPosTableService();
        const sale = await cancelPosTableService.execute({
            tenantId: req.auth.tenantId!,
            tableId: id,
            reason
        });

        return res.json(sale);
    }
}

export { CancelPosTableController };
