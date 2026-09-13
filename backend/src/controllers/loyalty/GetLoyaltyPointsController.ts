import { Request, Response } from 'express';
import { GetLoyaltyPointsService } from '../../services/loyalty/GetLoyaltyPointsService.js';
import { normalizePhone } from '../../utils/phone.js';

class GetLoyaltyPointsController {
    async handle(req: Request, res: Response) {
        const slug = req.params.slug as string;
        const customerPhone = normalizePhone(req.query.customerPhone as string);

        const getLoyaltyPointsService = new GetLoyaltyPointsService();
        const loyalty = await getLoyaltyPointsService.execute({
            slug,
            customerPhone
        });

        return res.json(loyalty);
    }
}

export { GetLoyaltyPointsController };
