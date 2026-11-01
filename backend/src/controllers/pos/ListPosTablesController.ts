import { Request, Response } from "express";
import { ListPosTablesService } from "../../services/pos/ListPosTablesService.js";

class ListPosTablesController {
    async handle(req: Request, res: Response) {
        const listPosTablesService = new ListPosTablesService();
        const tables = await listPosTablesService.execute({
            tenantId: req.auth.tenantId!
        });

        return res.json(tables);
    }
}

export { ListPosTablesController };
