import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";

interface GetTenantServiceProps {
    slug: string;
}

class GetTenantService {
    async execute({ slug }: GetTenantServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: {
                slug
            },
            select: {
                id: true,
                name: true,
                slug: true,
                phone: true,
                deliveryFee: true,
                isActive: true,
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

export { GetTenantService };