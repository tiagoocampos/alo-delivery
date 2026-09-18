import { resolveTenantOrThrow } from "./resolveTenantOrThrow.js";

interface GetTenantServiceProps {
    slug: string;
}

class GetTenantService {
    async execute({ slug }: GetTenantServiceProps) {

        const tenant = await resolveTenantOrThrow({ slug });

        return {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            phone: tenant.phone,
            deliveryFee: tenant.deliveryFee,
            isActive: tenant.isActive,
            logoUrl: tenant.logoUrl,
            bannerUrl: tenant.bannerUrl,
            faviconUrl: tenant.faviconUrl,
            description: tenant.description,
            address: tenant.address,
            instagramUrl: tenant.instagramUrl,
            minimumOrderValue: tenant.minimumOrderValue,
            businessHours: tenant.businessHours,
            createdAt: tenant.createdAt,
            updatedAt: tenant.updatedAt,
            effectivePlan: tenant.effectivePlan
        };
    }
}

export { GetTenantService };