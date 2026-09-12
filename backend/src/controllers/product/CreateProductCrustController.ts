import { Request, Response } from 'express';
import { CreateProductCrustService } from '../../services/product/CreateProductCrustService.js';

class CreateProductCrustController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;
        const { name, priceDelta } = req.body;

        const createProductCrustService = new CreateProductCrustService();
        const crust = await createProductCrustService.execute({
            tenantId: req.auth.tenantId!,
            productId: id,
            name,
            priceDelta
        });

        return res.status(201).json(crust);
    }
}

export { CreateProductCrustController };
