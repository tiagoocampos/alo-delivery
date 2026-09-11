import { Request, Response } from 'express';
import { RegisterTenantService } from '../../services/tenant/RegisterTenantService.js';


class RegisterTenantController {
    async handle(req: Request, res: Response) {
        const { storeName, ownerName, email, password } = req.body;

        const registerTenantService = new RegisterTenantService();
        const result = await registerTenantService.execute({
            storeName,
            ownerName,
            email,
            password
        });

        return res.status(201).json(result);
    }
}

export { RegisterTenantController };