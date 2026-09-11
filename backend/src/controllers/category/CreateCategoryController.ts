import { Request, Response } from 'express';
import { CreateCategoryService } from '../../services/category/CreateCategoryService.js';

class CreateCategoryController {
    async handle(req: Request, res: Response) {
        const { name, sortOrder } = req.body;

        const createCategoryService = new CreateCategoryService();
        const category = await createCategoryService.execute({
            tenantId: req.auth.tenantId!,
            name,
            sortOrder
        });

        return res.status(201).json(category);
    }
}

export { CreateCategoryController };
