import { Request, Response } from 'express';
import { RemoveFavoriteService } from '../../services/customer/RemoveFavoriteService.js';

class RemoveFavoriteController {
    async handle(req: Request, res: Response) {
        const service = new RemoveFavoriteService();
        const result = await service.execute({
            slug: req.params.slug as string,
            productId: req.params.productId as string,
            customerId: req.customerAuth!.customerId,
            customerTenantId: req.customerAuth!.tenantId
        });

        return res.json(result);
    }
}

export { RemoveFavoriteController };
