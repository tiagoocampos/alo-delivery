import { Request, Response } from 'express';
import { CreateProductService } from '../../services/product/CreateProductService.js';
import { readIngredientsField } from '../../utils/ingredients.js';

class CreateProductController {
    async handle(req: Request, res: Response) {
        const { name, description, basePrice, categoryId, badge, availability } = req.body;

        const createProductService = new CreateProductService();
        const product = await createProductService.execute({
            tenantId: req.auth.tenantId!,
            name,
            description,
            basePrice: basePrice === undefined || basePrice === "" ? undefined : parseInt(basePrice),
            categoryId,
            badge,
            availability,
            ingredients: readIngredientsField(req.body.ingredients),
            imageBuffer: req.file?.buffer,
            imageName: req.file?.originalname
        });

        return res.status(201).json(product);
    }
}

export { CreateProductController };
