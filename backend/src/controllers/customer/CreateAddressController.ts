import { Request, Response } from 'express';
import { CreateAddressService } from '../../services/customer/CreateAddressService.js';

class CreateAddressController {
    async handle(req: Request, res: Response) {
        const { label, street, number, complement, neighborhood, city, isDefault } = req.body;

        const createAddressService = new CreateAddressService();
        const address = await createAddressService.execute({
            customerId: req.customerAuth!.customerId,
            label,
            street,
            number,
            complement,
            neighborhood,
            city,
            isDefault
        });

        return res.status(201).json(address);
    }
}

export { CreateAddressController };
