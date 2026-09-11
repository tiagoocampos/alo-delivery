import { Request, Response } from 'express';
import { GetOrderDetailService } from '../../services/order/GetOrderDetailService.js';

class GetOrderDetailController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;

        const getOrderDetailService = new GetOrderDetailService();
        const order = await getOrderDetailService.execute({
            tenantId: req.auth.tenantId!,
            orderId: id
        });

        return res.json(order);
    }
}

export { GetOrderDetailController };
