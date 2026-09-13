import { Request, Response } from "express";
import { CreateOrderPushSubscriptionService } from "../../services/order/CreateOrderPushSubscriptionService.js";

class CreateOrderPushSubscriptionController {
    async handle(req: Request, res: Response) {
        const { slug, orderId } = req.params as { slug: string; orderId: string };
        const { endpoint, keys } = req.body;

        const createOrderPushSubscriptionService = new CreateOrderPushSubscriptionService();
        const subscription = await createOrderPushSubscriptionService.execute({
            slug,
            orderId,
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth
        });

        return res.status(201).json(subscription);
    }
}

export { CreateOrderPushSubscriptionController };
