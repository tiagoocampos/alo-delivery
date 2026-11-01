import { Request, Response } from "express";
import { DiscardPosTableService } from "../../services/pos/DiscardPosTableService.js";

class DiscardPosTableController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;

        const discardPosTableService = new DiscardPosTableService();
        await discardPosTableService.execute({
            tenantId: req.auth.tenantId!,
            tableId: id
        });

        return res.status(204).send();
    }
}

export { DiscardPosTableController };
