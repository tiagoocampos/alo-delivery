import { Request, Response } from 'express';
import { CreateProductExtraService } from '../../services/product/CreateProductExtraService.js';

class CreateProductExtraController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;
        const { name, price } = req.body;

        const createProductExtraService = new CreateProductExtraService();
        const extra = await createProductExtraService.execute({
            tenantId: req.auth.tenantId!,
            productId: id,
            name,
            price
        });

        return res.status(201).json(extra);
    }
}

export { CreateProductExtraController };
