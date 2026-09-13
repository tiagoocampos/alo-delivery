import { Request, Response } from 'express';
import { CancelCustomerOrderService } from '../../services/customer/CancelCustomerOrderService.js';

class CancelCustomerOrderController {
    async handle(req: Request, res: Response) {
        const slug = req.params.slug as string;
        const orderId = req.params.orderId as string;
        const { reason } = req.body;

        const cancelCustomerOrderService = new CancelCustomerOrderService();
        const order = await cancelCustomerOrderService.execute({
            slug,
            orderId,
            customerId: req.customerAuth!.customerId,
            customerTenantId: req.customerAuth!.tenantId,
            reason
        });

        return res.json(order);
    }
}

export { CancelCustomerOrderController };
