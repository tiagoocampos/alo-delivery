import { Request, Response } from "express";
import { ListPlatformPaymentsService } from "../../services/admin/ListPlatformPaymentsService.js";

class ListPlatformPaymentsController {
    async handle(req: Request, res: Response) {
        const tenantId = req.query.tenantId as string | undefined;
        const month = req.query.month as string | undefined;

        const listPlatformPaymentsService = new ListPlatformPaymentsService();
        const payments = await listPlatformPaymentsService.execute({ tenantId, month });

        return res.json(payments);
    }
}

export { ListPlatformPaymentsController };
