import { Request, Response } from 'express';
import { ListFavoritesService } from '../../services/customer/ListFavoritesService.js';

class ListFavoritesController {
    async handle(req: Request, res: Response) {
        const service = new ListFavoritesService();
        const result = await service.execute({
            slug: req.params.slug as string,
            customerId: req.customerAuth!.customerId,
            customerTenantId: req.customerAuth!.tenantId
        });

        return res.json(result);
    }
}

export { ListFavoritesController };
