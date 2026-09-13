import { Request, Response } from "express";
import { ListAdminTenantsService } from "../../services/admin/ListAdminTenantsService.js";

class ListAdminTenantsController {
    async handle(req: Request, res: Response) {
        const listAdminTenantsService = new ListAdminTenantsService();
        const tenants = await listAdminTenantsService.execute();

        return res.json(tenants);
    }
}

export { ListAdminTenantsController };
