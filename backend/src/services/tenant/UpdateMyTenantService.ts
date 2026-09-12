import { TenantNotFoundError, TenantSlugAlreadyInUseError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";

interface UpdateMyTenantServiceProps {
    tenantId: string;
    name?: string;
    slug?: string;
    phone?: string;
    deliveryFee?: number;
    isActive?: boolean;
}

class UpdateMyTenantService {
    async execute({ tenantId, name, slug, phone, deliveryFee, isActive }: UpdateMyTenantServiceProps) {
        const tenant = await prismaClient.tenant.findUnique({
            where: {
                id: tenantId
            }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        if (slug && slug !== tenant.slug) {
            const slugInUse = await prismaClient.tenant.findUnique({
                where: { slug },
                select: { id: true }
            });

            if (slugInUse) {
                throw new TenantSlugAlreadyInUseError();
            }
        }

        const updatedTenant = await prismaClient.tenant.update({
            where: {
                id: tenantId
            },
            data: {
                ...(name !== undefined && { name }),
                ...(slug !== undefined && { slug }),
                ...(phone !== undefined && { phone }),
                ...(deliveryFee !== undefined && { deliveryFee }),
                ...(isActive !== undefined && { isActive })
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

        return updatedTenant;
    }
}

export { UpdateMyTenantService };
