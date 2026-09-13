import { Request, Response } from "express";
import { GetAdminTenantDetailService } from "../../services/admin/GetAdminTenantDetailService.js";

class GetAdminTenantDetailController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };

        const getAdminTenantDetailService = new GetAdminTenantDetailService();
        const tenant = await getAdminTenantDetailService.execute({ tenantId: id });

        return res.json(tenant);
    }
}

export { GetAdminTenantDetailController };
