import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";

interface GetMyTenantServiceProps {
    tenantId: string;
}

class GetMyTenantService {
    async execute({ tenantId }: GetMyTenantServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: {
                id: tenantId
            },
            select: {
                id: true,
                name: true,
                slug: true,
                phone: true,
                deliveryFee: true,
                isActive: true,
                logoUrl: true,
                bannerUrl: true,
                faviconUrl: true,
                description: true,
                address: true,
                instagramUrl: true,
                pixKey: true,
                minimumOrderValue: true,
                businessHours: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        return tenant;
    }
}

export { GetMyTenantService };
