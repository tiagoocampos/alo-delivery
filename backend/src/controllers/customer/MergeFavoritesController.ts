import { Request, Response } from 'express';
import { MergeFavoritesService } from '../../services/customer/MergeFavoritesService.js';

class MergeFavoritesController {
    async handle(req: Request, res: Response) {
        const service = new MergeFavoritesService();
        const result = await service.execute({
            slug: req.params.slug as string,
            productIds: req.body.productIds as string[],
            customerId: req.customerAuth!.customerId,
            customerTenantId: req.customerAuth!.tenantId
        });

        return res.json(result);
    }
}

export { MergeFavoritesController };
