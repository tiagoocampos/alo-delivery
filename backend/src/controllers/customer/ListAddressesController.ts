import { Request, Response } from 'express';
import { ListAddressesService } from '../../services/customer/ListAddressesService.js';

class ListAddressesController {
    async handle(req: Request, res: Response) {
        const listAddressesService = new ListAddressesService();
        const addresses = await listAddressesService.execute({
            customerId: req.customerAuth!.customerId
        });

        return res.json(addresses);
    }
}

export { ListAddressesController };
