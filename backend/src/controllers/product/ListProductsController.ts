import { Request, Response } from 'express';
import { ListProductsService } from '../../services/product/ListProductsService.js';
import type { ProductAvailability } from '../../generated/prisma/enums.js';

class ListProductsController {
    async handle(req: Request, res: Response) {
        const categoryId = req.query.categoryId as string | undefined;
        const isActive = req.query.isActive as string | undefined;
        const availability = req.query.availability as ProductAvailability | undefined;

        const listProductsService = new ListProductsService();
        const products = await listProductsService.execute({
            tenantId: req.auth.tenantId!,
            categoryId,
            isActive: isActive === undefined ? undefined : isActive === "true",
            availability
        });

        return res.json(products);
    }
}

export { ListProductsController };
