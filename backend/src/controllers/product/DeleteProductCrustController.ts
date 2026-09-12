import { Request, Response } from 'express';
import { DeleteProductCrustService } from '../../services/product/DeleteProductCrustService.js';

class DeleteProductCrustController {
    async handle(req: Request, res: Response) {
        const { id, crustId } = req.params as { id: string; crustId: string };

        const deleteProductCrustService = new DeleteProductCrustService();
        const crust = await deleteProductCrustService.execute({
            tenantId: req.auth.tenantId!,
            productId: id,
            crustId
        });

        return res.json(crust);
    }
}

export { DeleteProductCrustController };
