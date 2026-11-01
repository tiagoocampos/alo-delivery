import { Request, Response } from "express";
import { UpdatePosTableItemService } from "../../services/pos/UpdatePosTableItemService.js";

class UpdatePosTableItemController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;
        const itemId = req.params.itemId as string;
        const { quantity } = req.body;

        const updatePosTableItemService = new UpdatePosTableItemService();
        const table = await updatePosTableItemService.execute({
            tenantId: req.auth.tenantId!,
            tableId: id,
            itemId,
            quantity
        });

        return res.json(table);
    }
}

export { UpdatePosTableItemController };
