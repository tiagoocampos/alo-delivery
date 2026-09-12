import { Request, Response } from 'express';
import { CreateProductService } from '../../services/product/CreateProductService.js';
import { ProductImageRequiredError } from '../../errors/product/ProductErrors.js';

class CreateProductController {
    async handle(req: Request, res: Response) {
        const { name, description, basePrice, categoryId, badge } = req.body;

        if (!req.file) {
            throw new ProductImageRequiredError();
        }

        const createProductService = new CreateProductService();
        const product = await createProductService.execute({
            tenantId: req.auth.tenantId!,
            name,
            description,
            basePrice: basePrice === undefined || basePrice === "" ? undefined : parseInt(basePrice),
            categoryId,
            badge,
            imageBuffer: req.file.buffer,
            imageName: req.file.originalname
        });

        return res.status(201).json(product);
    }
}

export { CreateProductController };
