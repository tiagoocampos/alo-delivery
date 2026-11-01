import { Request, Response } from "express";
import { OpenPosTableService } from "../../services/pos/OpenPosTableService.js";

class OpenPosTableController {
    async handle(req: Request, res: Response) {
        const { label } = req.body;

        const openPosTableService = new OpenPosTableService();
        const table = await openPosTableService.execute({
            tenantId: req.auth.tenantId!,
            label
        });

        return res.status(201).json(table);
    }
}

export { OpenPosTableController };
