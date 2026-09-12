import { Request, Response } from "express";
import { CreateCategorySizeService } from "../../services/category/CreateCategorySizeService.js";

class CreateCategorySizeController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const { name, price, maxFlavors } = req.body;

        const createCategorySizeService = new CreateCategorySizeService();
        const size = await createCategorySizeService.execute({
            tenantId: req.auth.tenantId!,
            categoryId: id,
            name,
            price,
            maxFlavors
        });

        return res.status(201).json(size);
    }
}

export { CreateCategorySizeController };
