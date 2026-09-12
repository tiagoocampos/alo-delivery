import { Request, Response } from 'express';
import { DeleteProductFlavorService } from '../../services/product/DeleteProductFlavorService.js';

class DeleteProductFlavorController {
    async handle(req: Request, res: Response) {
        const { id, flavorId } = req.params as { id: string; flavorId: string };

        const deleteProductFlavorService = new DeleteProductFlavorService();
        const flavor = await deleteProductFlavorService.execute({
            tenantId: req.auth.tenantId!,
            productId: id,
            flavorId
        });

        return res.json(flavor);
    }
}

export { DeleteProductFlavorController };
