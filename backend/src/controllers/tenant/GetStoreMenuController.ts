import { Request, Response } from "express";
import { GetStoreMenuService } from "../../services/tenant/GetStoreMenuService.js";

class GetStoreMenuController {
    async handle(req: Request, res: Response) {
        const slug = req.params.slug as string;

        const getStoreMenuService = new GetStoreMenuService();
        const menu = await getStoreMenuService.execute({
            slug
        });

        return res.json(menu);
    }
}

export { GetStoreMenuController };
