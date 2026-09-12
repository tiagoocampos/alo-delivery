import { Request, Response } from 'express';
import { CreateProductFlavorService } from '../../services/product/CreateProductFlavorService.js';

class CreateProductFlavorController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;
        const { name } = req.body;

        const createProductFlavorService = new CreateProductFlavorService();
        const flavor = await createProductFlavorService.execute({
            tenantId: req.auth.tenantId!,
            productId: id,
            name
        });

        return res.status(201).json(flavor);
    }
}

export { CreateProductFlavorController };
