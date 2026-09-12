import { Request, Response } from "express";
import { CreateCategoryCrustService } from "../../services/category/CreateCategoryCrustService.js";

class CreateCategoryCrustController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const { name, priceDelta } = req.body;

        const createCategoryCrustService = new CreateCategoryCrustService();
        const crust = await createCategoryCrustService.execute({
            tenantId: req.auth.tenantId!,
            categoryId: id,
            name,
            priceDelta
        });

        return res.status(201).json(crust);
    }
}

export { CreateCategoryCrustController };
