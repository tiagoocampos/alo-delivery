import { Request, Response } from 'express';
import { CreateOrderService } from '../../services/order/CreateOrderService.js';

class CreateOrderController {
    async handle(req: Request, res: Response) {
        const slug = req.params.slug as string;
        const { customerName, customerPhone, address, paymentMethod, items } = req.body;

        const createOrderService = new CreateOrderService();
        const order = await createOrderService.execute({
            slug,
            customerName,
            customerPhone,
            address,
            paymentMethod,
            items
        });

        return res.status(201).json(order);
    }
}

export { CreateOrderController };
