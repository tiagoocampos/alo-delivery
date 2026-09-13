import { Request, Response } from "express";
import { UpsertSubscriptionService } from "../../services/admin/UpsertSubscriptionService.js";

class UpsertSubscriptionController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const { planName, monthlyPrice, status } = req.body;

        const upsertSubscriptionService = new UpsertSubscriptionService();
        const subscription = await upsertSubscriptionService.execute({
            tenantId: id,
            planName,
            monthlyPrice,
            status
        });

        return res.json(subscription);
    }
}

export { UpsertSubscriptionController };
