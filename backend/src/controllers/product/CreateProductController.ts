import { Request, Response } from 'express';
import { CreateProductService } from '../../services/product/CreateProductService.js';
import { ProductImageRequiredError } from '../../errors/product/ProductErrors.js';

class CreateProductController {
    async handle(req: Request, res: Response) {
        const { name, description, basePrice, categoryId, badge, availability } = req.body;

        // Produto só de balcão não aparece no storefront, então não precisa de imagem.
        if (!req.file && availability !== "balcao") {
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
            availability,
            imageBuffer: req.file?.buffer,
            imageName: req.file?.originalname
        });

        return res.status(201).json(product);
    }
}

export { CreateProductController };
