import { Request, Response } from "express";
import { DeleteCategoryCrustService } from "../../services/category/DeleteCategoryCrustService.js";

class DeleteCategoryCrustController {
    async handle(req: Request, res: Response) {
        const { id, crustId } = req.params as { id: string; crustId: string };

        const deleteCategoryCrustService = new DeleteCategoryCrustService();
        const crust = await deleteCategoryCrustService.execute({
            tenantId: req.auth.tenantId!,
            categoryId: id,
            crustId
        });

        return res.json(crust);
    }
}

export { DeleteCategoryCrustController };
