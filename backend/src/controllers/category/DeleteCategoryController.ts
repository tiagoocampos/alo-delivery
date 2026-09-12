import { Request, Response } from "express";
import { DeleteCategoryService } from "../../services/category/DeleteCategoryService.js";

class DeleteCategoryController {
    async handle(req: Request, res: Response) {
        const { categoryId } = req.params as { categoryId: string };

        const deleteCategoryService = new DeleteCategoryService();

        const category = await deleteCategoryService.execute({
            tenantId: req.auth.tenantId!,
            categoryId
        });

        return res.json(category);
    }
}

export { DeleteCategoryController };