import { Request, Response } from 'express';
import { DeleteAddressService } from '../../services/customer/DeleteAddressService.js';

class DeleteAddressController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;

        const deleteAddressService = new DeleteAddressService();
        const result = await deleteAddressService.execute({
            customerId: req.customerAuth!.customerId,
            addressId: id
        });

        return res.json(result);
    }
}

export { DeleteAddressController };
