import { Request, Response } from "express";
import { CancelPosSaleService } from "../../services/pos/CancelPosSaleService.js";

class CancelPosSaleController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;
        const { reason } = req.body;

        const cancelPosSaleService = new CancelPosSaleService();
        const sale = await cancelPosSaleService.execute({
            tenantId: req.auth.tenantId!,
            saleId: id,
            reason
        });

        return res.json(sale);
    }
}

export { CancelPosSaleController };
