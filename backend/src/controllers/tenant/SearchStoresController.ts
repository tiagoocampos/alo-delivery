import { Request, Response } from "express";
import { SearchStoresService } from "../../services/tenant/SearchStoresService.js";

class SearchStoresController {
    async handle(req: Request, res: Response) {
        const { q } = req.query as { q?: string };

        const searchStoresService = new SearchStoresService();
        const stores = await searchStoresService.execute({ q: q ?? "" });

        return res.json(stores);
    }
}

export { SearchStoresController };
