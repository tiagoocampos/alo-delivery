import { Request, Response } from 'express';
import { ListOrdersService } from '../../services/order/ListOrdersService.js';
import type { OrderStatus } from '../../generated/prisma/enums.js';

class ListOrdersController {
    async handle(req: Request, res: Response) {
        const status = req.query.status as OrderStatus | undefined;

        const listOrdersService = new ListOrdersService();
        const orders = await listOrdersService.execute({
            tenantId: req.auth.tenantId!,
            status
        });

        return res.json(orders);
    }
}

export { ListOrdersController };
