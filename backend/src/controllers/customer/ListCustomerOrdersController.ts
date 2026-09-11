import { Request, Response } from 'express';
import { ListCustomerOrdersService } from '../../services/customer/ListCustomerOrdersService.js';

class ListCustomerOrdersController {
    async handle(req: Request, res: Response) {
        const slug = req.params.slug as string;

        const listCustomerOrdersService = new ListCustomerOrdersService();
        const orders = await listCustomerOrdersService.execute({
            slug,
            customerId: req.customerAuth!.customerId,
            customerTenantId: req.customerAuth!.tenantId
        });

        return res.json(orders);
    }
}

export { ListCustomerOrdersController };
