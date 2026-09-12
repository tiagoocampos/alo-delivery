import { Request, Response } from "express";
import { GetMyTenantService } from "../../services/tenant/GetMyTenantService.js";

class GetMyTenantController {
    async handle(req: Request, res: Response) {
        const tenantId = req.auth!.tenantId as string;

        const getMyTenantService = new GetMyTenantService();

        const tenant = await getMyTenantService.execute({
            tenantId
        });

        return res.json(tenant);
    }
}

export { GetMyTenantController };
