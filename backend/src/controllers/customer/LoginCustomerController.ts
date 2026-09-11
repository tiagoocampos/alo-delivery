import { Request, Response } from 'express';
import { LoginCustomerService } from '../../services/customer/LoginCustomerService.js';

class LoginCustomerController {
    async handle(req: Request, res: Response) {
        const slug = req.params.slug as string;
        const { phone, password } = req.body;

        const loginCustomerService = new LoginCustomerService();
        const result = await loginCustomerService.execute({ slug, phone, password });

        return res.status(200).json(result);
    }
}

export { LoginCustomerController };
