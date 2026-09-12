import { Request, Response } from "express";
import { GetDashboardTopProductsService } from "../../services/dashboard/GetDashboardTopProductsService.js";

class GetDashboardTopProductsController {
    async handle(req: Request, res: Response) {
        const days = req.query.days === undefined ? undefined : parseInt(req.query.days as string);
        const limit = req.query.limit === undefined ? undefined : parseInt(req.query.limit as string);

        const getDashboardTopProductsService = new GetDashboardTopProductsService();
        const topProducts = await getDashboardTopProductsService.execute({
            tenantId: req.auth.tenantId!,
            days,
            limit
        });

        return res.json(topProducts);
    }
}

export { GetDashboardTopProductsController };
