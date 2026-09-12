import { Request, Response } from "express";
import { UpdateMyTenantService } from "../../services/tenant/UpdateMyTenantService.js";

class UpdateMyTenantController {
    async handle(req: Request, res: Response) {
        const tenantId = req.auth!.tenantId as string;
        const { name, slug, phone, deliveryFee, isActive, description, address, instagramUrl } = req.body;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const logoFile = files?.logo?.[0];
        const bannerFile = files?.banner?.[0];
        const faviconFile = files?.favicon?.[0];

        const minimumOrderValue = req.body.minimumOrderValue === undefined
            ? undefined
            : typeof req.body.minimumOrderValue === "string"
                ? parseInt(req.body.minimumOrderValue)
                : req.body.minimumOrderValue;

        const businessHours = req.body.businessHours === undefined
            ? undefined
            : typeof req.body.businessHours === "string"
                ? JSON.parse(req.body.businessHours)
                : req.body.businessHours;

        const updateMyTenantService = new UpdateMyTenantService();

        const tenant = await updateMyTenantService.execute({
            tenantId,
            name,
            slug,
            phone,
            deliveryFee,
            isActive,
            description,
            address,
            instagramUrl,
            minimumOrderValue,
            businessHours,
            logoBuffer: logoFile?.buffer,
            logoName: logoFile?.originalname,
            bannerBuffer: bannerFile?.buffer,
            bannerName: bannerFile?.originalname,
            faviconBuffer: faviconFile?.buffer,
            faviconName: faviconFile?.originalname
        });

        return res.json(tenant);
    }
}

export { UpdateMyTenantController };
