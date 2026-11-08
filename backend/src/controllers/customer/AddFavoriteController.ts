import { Request, Response } from 'express';
import { AddFavoriteService } from '../../services/customer/AddFavoriteService.js';

class AddFavoriteController {
    async handle(req: Request, res: Response) {
        const service = new AddFavoriteService();
        const result = await service.execute({
            slug: req.params.slug as string,
            productId: req.params.productId as string,
            customerId: req.customerAuth!.customerId,
            customerTenantId: req.customerAuth!.tenantId
        });

        return res.json(result);
    }
}

export { AddFavoriteController };
