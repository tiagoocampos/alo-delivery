import { Request, Response } from "express";
import { GetAdminRevenueService } from "../../services/admin/GetAdminRevenueService.js";

class GetAdminRevenueController {
    async handle(req: Request, res: Response) {
        const months = req.query.months === undefined ? undefined : parseInt(req.query.months as string);

        const getAdminRevenueService = new GetAdminRevenueService();
        const revenue = await getAdminRevenueService.execute({ months });

        return res.json(revenue);
    }
}

export { GetAdminRevenueController };
