import { Request, Response } from 'express';
import { UpdateProductService } from '../../services/product/UpdateProductService.js';

class UpdateProductController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;
        const { name, description, basePrice, categoryId, isActive } = req.body;

        const updateProductService = new UpdateProductService();
        const product = await updateProductService.execute({
            tenantId: req.auth.tenantId!,
            productId: id,
            name,
            description,
            basePrice: basePrice === undefined ? undefined : parseInt(basePrice),
            categoryId,
            isActive: isActive === undefined ? undefined : isActive === "true",
            imageBuffer: req.file?.buffer,
            imageName: req.file?.originalname
        });

        return res.json(product);
    }
}

export { UpdateProductController };
