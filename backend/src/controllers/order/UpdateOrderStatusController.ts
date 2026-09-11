import { Request, Response } from 'express';
import { UpdateOrderStatusService } from '../../services/order/UpdateOrderStatusService.js';

class UpdateOrderStatusController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;
        const { status } = req.body;

        const updateOrderStatusService = new UpdateOrderStatusService();
        const order = await updateOrderStatusService.execute({
            tenantId: req.auth.tenantId!,
            orderId: id,
            status
        });

        return res.json(order);
    }
}

export { UpdateOrderStatusController };
