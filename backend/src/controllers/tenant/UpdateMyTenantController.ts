import { Request, Response } from "express";
import { UpdateMyTenantService } from "../../services/tenant/UpdateMyTenantService.js";

class UpdateMyTenantController {
    async handle(req: Request, res: Response) {
        const tenantId = req.auth!.tenantId as string;
        const { name, slug, phone, deliveryFee, isActive } = req.body;

        const updateMyTenantService = new UpdateMyTenantService();

        const tenant = await updateMyTenantService.execute({
            tenantId,
            name,
            slug,
            phone,
            deliveryFee,
            isActive
        });

        return res.json(tenant);
    }
}

export { UpdateMyTenantController };
