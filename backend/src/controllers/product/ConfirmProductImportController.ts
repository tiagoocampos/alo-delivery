import { Request, Response } from 'express';
import { confirmProductImportSchema } from '../../schemas/productImportSchema.js';
import { ConfirmProductImportService } from '../../services/product/ConfirmProductImportService.js';

class ConfirmProductImportController {
    async handle(req: Request, res: Response) {
        const service = new ConfirmProductImportService();
        const result = await service.execute({
            tenantId: req.auth.tenantId!,
            // Reparse para aplicar o trim do Zod (validateSchema só valida, não reescreve o body).
            items: confirmProductImportSchema.parse({ body: req.body }).body.items
        });

        return res.status(201).json(result);
    }
}

export { ConfirmProductImportController };
