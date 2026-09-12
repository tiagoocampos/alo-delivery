import { Request, Response } from "express";
import { UpdateCategoryCrustService } from "../../services/category/UpdateCategoryCrustService.js";

class UpdateCategoryCrustController {
    async handle(req: Request, res: Response) {
        const { id, crustId } = req.params as { id: string; crustId: string };
        const { name, priceDelta } = req.body;

        const updateCategoryCrustService = new UpdateCategoryCrustService();
        const crust = await updateCategoryCrustService.execute({
            tenantId: req.auth.tenantId!,
            categoryId: id,
            crustId,
            name,
            priceDelta
        });

        return res.json(crust);
    }
}

export { UpdateCategoryCrustController };
