import { Request, Response } from "express";
import { GetAdminSummaryService } from "../../services/admin/GetAdminSummaryService.js";

class GetAdminSummaryController {
    async handle(req: Request, res: Response) {
        const getAdminSummaryService = new GetAdminSummaryService();
        const summary = await getAdminSummaryService.execute();

        return res.json(summary);
    }
}

export { GetAdminSummaryController };
