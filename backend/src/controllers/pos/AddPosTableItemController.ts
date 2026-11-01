import { Request, Response } from "express";
import { AddPosTableItemService } from "../../services/pos/AddPosTableItemService.js";

class AddPosTableItemController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;

        const addPosTableItemService = new AddPosTableItemService();
        const table = await addPosTableItemService.execute({
            tenantId: req.auth.tenantId!,
            tableId: id,
            item: req.body
        });

        return res.status(201).json(table);
    }
}

export { AddPosTableItemController };
