import { Request, Response } from "express";
import { UpdateProductExtraService } from "../../services/product/UpdateProductExtraService.js";

class UpdateProductExtraController {
    async handle(req: Request, res: Response) {
        const { id, extraId } = req.params as { id: string; extraId: string };
        const { name, price } = req.body;

        const updateProductExtraService = new UpdateProductExtraService();
        const extra = await updateProductExtraService.execute({
            tenantId: req.auth.tenantId!,
            productId: id,
            extraId,
            name,
            price
        });

        return res.json(extra);
    }
}

export { UpdateProductExtraController };
