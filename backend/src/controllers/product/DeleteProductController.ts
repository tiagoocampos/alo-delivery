import { Request, Response } from 'express';
import { DeleteProductService } from '../../services/product/DeleteProductService.js';

class DeleteProductController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;

        const deleteProductService = new DeleteProductService();
        const product = await deleteProductService.execute({
            tenantId: req.auth.tenantId!,
            productId: id
        });

        return res.json(product);
    }
}

export { DeleteProductController };
