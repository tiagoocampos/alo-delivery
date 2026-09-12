import { Request, Response } from "express";
import { GetDashboardRevenueService } from "../../services/dashboard/GetDashboardRevenueService.js";

class GetDashboardRevenueController {
    async handle(req: Request, res: Response) {
        const days = req.query.days === undefined ? undefined : parseInt(req.query.days as string);

        const getDashboardRevenueService = new GetDashboardRevenueService();
        const revenue = await getDashboardRevenueService.execute({
            tenantId: req.auth.tenantId!,
            days
        });

        return res.json(revenue);
    }
}

export { GetDashboardRevenueController };
