import { Request, Response } from "express";
import { CreatePlatformPaymentService } from "../../services/admin/CreatePlatformPaymentService.js";

class CreatePlatformPaymentController {
    async handle(req: Request, res: Response) {
        const { tenantId, amount, paidAt, note } = req.body;

        const createPlatformPaymentService = new CreatePlatformPaymentService();
        const payment = await createPlatformPaymentService.execute({ tenantId, amount, paidAt, note });

        return res.status(201).json(payment);
    }
}

export { CreatePlatformPaymentController };
