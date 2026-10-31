import { Request, Response } from "express";
import { CreatePosSaleService } from "../../services/pos/CreatePosSaleService.js";

class CreatePosSaleController {
    async handle(req: Request, res: Response) {
        const { clientId, paymentMethod, items } = req.body;

        const createPosSaleService = new CreatePosSaleService();
        const { sale, created } = await createPosSaleService.execute({
            tenantId: req.auth.tenantId!,
            clientId,
            paymentMethod,
            items
        });

        // 200 quando o clientId já tinha uma venda (reenvio idempotente).
        return res.status(created ? 201 : 200).json(sale);
    }
}

export { CreatePosSaleController };
