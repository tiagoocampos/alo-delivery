import { Request, Response } from 'express';
import { CreateProductVariantService } from '../../services/product/CreateProductVariantService.js';

class CreateProductVariantController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;
        const { name, priceDelta, maxFlavors } = req.body;

        const createProductVariantService = new CreateProductVariantService();
        const variant = await createProductVariantService.execute({
            tenantId: req.auth.tenantId!,
            productId: id,
            name,
            priceDelta,
            maxFlavors
        });

        return res.status(201).json(variant);
    }
}

export { CreateProductVariantController };
