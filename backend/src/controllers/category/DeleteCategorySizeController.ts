import { Request, Response } from "express";
import { DeleteCategorySizeService } from "../../services/category/DeleteCategorySizeService.js";

class DeleteCategorySizeController {
    async handle(req: Request, res: Response) {
        const { id, sizeId } = req.params as { id: string; sizeId: string };

        const deleteCategorySizeService = new DeleteCategorySizeService();
        const size = await deleteCategorySizeService.execute({
            tenantId: req.auth.tenantId!,
            categoryId: id,
            sizeId
        });

        return res.json(size);
    }
}

export { DeleteCategorySizeController };
