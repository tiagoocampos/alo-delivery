import { Request, Response } from "express";
import { UpdateCategoryService } from "../../services/category/UpdateCategoryService.js";

class UpdateCategoryController {
    async handle(req: Request, res: Response) {
        const { categoryId } = req.params as { categoryId: string };
        const { name, sortOrder, isActive } = req.body;

        const updateCategoryService = new UpdateCategoryService();

        const category = await updateCategoryService.execute({
            tenantId: req.auth.tenantId!,
            categoryId,
            name,
            sortOrder,
            isActive
        });

        return res.json(category);
    }
}

export { UpdateCategoryController };
