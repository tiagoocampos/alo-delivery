import { Request, Response } from 'express';
import { UpdateAddressService } from '../../services/customer/UpdateAddressService.js';

class UpdateAddressController {
    async handle(req: Request, res: Response) {
        const id = req.params.id as string;
        const { label, street, number, complement, neighborhood, city, isDefault } = req.body;

        const updateAddressService = new UpdateAddressService();
        const address = await updateAddressService.execute({
            customerId: req.customerAuth!.customerId,
            addressId: id,
            label,
            street,
            number,
            complement,
            neighborhood,
            city,
            isDefault
        });

        return res.json(address);
    }
}

export { UpdateAddressController };
