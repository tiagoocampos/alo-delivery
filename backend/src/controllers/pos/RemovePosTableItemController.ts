import { Request, Response } from "express";
import { RemovePosTableItemService } from "../../services/pos/RemovePosTableItemService.js";

class RemovePosTableItemController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;
        const itemId = req.params.itemId as string;

        const removePosTableItemService = new RemovePosTableItemService();
        const table = await removePosTableItemService.execute({
            tenantId: req.auth.tenantId!,
            tableId: id,
            itemId
        });

        return res.json(table);
    }
}

export { RemovePosTableItemController };
