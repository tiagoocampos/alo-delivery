import { Request, Response } from "express";
import { UpdateCategorySizeService } from "../../services/category/UpdateCategorySizeService.js";

class UpdateCategorySizeController {
    async handle(req: Request, res: Response) {
        const { id, sizeId } = req.params as { id: string; sizeId: string };
        const { name, price, maxFlavors } = req.body;

        const updateCategorySizeService = new UpdateCategorySizeService();
        const size = await updateCategorySizeService.execute({
            tenantId: req.auth.tenantId!,
            categoryId: id,
            sizeId,
            name,
            price,
            maxFlavors
        });

        return res.json(size);
    }
}

export { UpdateCategorySizeController };
