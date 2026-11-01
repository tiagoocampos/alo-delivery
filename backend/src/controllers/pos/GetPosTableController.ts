import { Request, Response } from "express";
import { GetPosTableService } from "../../services/pos/GetPosTableService.js";

class GetPosTableController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;

        const getPosTableService = new GetPosTableService();
        const table = await getPosTableService.execute({
            tenantId: req.auth.tenantId!,
            tableId: id
        });

        return res.json(table);
    }
}

export { GetPosTableController };
