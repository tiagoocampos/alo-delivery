import { Request, Response } from 'express';
import { PreviewProductImportService } from '../../services/product/PreviewProductImportService.js';

class PreviewProductImportController {
    async handle(req: Request, res: Response) {
        const service = new PreviewProductImportService();
        const result = await service.execute({
            tenantId: req.auth.tenantId!,
            text: typeof req.body?.text === "string" ? req.body.text : undefined,
            image: req.file ? { data: req.file.buffer, mimeType: req.file.mimetype === "image/jpg" ? "image/jpeg" : req.file.mimetype } : undefined
        });

        return res.json(result);
    }
}

export { PreviewProductImportController };
