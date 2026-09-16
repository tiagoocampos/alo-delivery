import { Request, Response } from "express";
import { DeleteProductExtraService } from "../../services/product/DeleteProductExtraService.js";

class DeleteProductExtraController {
    async handle(req: Request, res: Response) {
        const { id, extraId } = req.params as { id: string; extraId: string };

        const deleteProductExtraService = new DeleteProductExtraService();
        const extra = await deleteProductExtraService.execute({
            tenantId: req.auth.tenantId!,
            productId: id,
            extraId
        });

        return res.json(extra);
    }
}

export { DeleteProductExtraController };
