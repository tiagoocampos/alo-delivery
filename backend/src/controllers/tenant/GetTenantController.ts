import { Request, Response } from "express";
import { GetTenantService } from "../../services/tenant/GetTenantService.js";

class GetTenantController {
    async handle(req: Request, res: Response) {
        const { slug } = req.params;

        if (!slug || typeof slug !== "string") {
            return res.status(400).json({
                error: "Slug da loja é obrigatório"
            });
        }

        const getTenantService = new GetTenantService();

        const tenant = await getTenantService.execute({
            slug
        });

        return res.json(tenant);
    }
}

export { GetTenantController };