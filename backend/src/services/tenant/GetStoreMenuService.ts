import { TenantInactiveError, TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";

interface GetStoreMenuServiceProps {
    slug: string;
}

class GetStoreMenuService {
    async execute({ slug }: GetStoreMenuServiceProps) {

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
                logoUrl: true,
                bannerUrl: true,
                faviconUrl: true,
                description: true,
                address: true,
                instagramUrl: true,
                minimumOrderValue: true,
                businessHours: true
            }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        if (!tenant.isActive) {
            throw new TenantInactiveError();
        }

        // Rota pública: só sai o que está ativo.
        const categories = await prismaClient.category.findMany({
            where: {
                tenantId: tenant.id,
                isActive: true
            },
            orderBy: [
                { sortOrder: "asc" },
                { name: "asc" }
            ],
            select: {
                id: true,
                name: true,
                sortOrder: true,
                sizes: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        maxFlavors: true
                    }
                },
                crusts: {
                    select: {
                        id: true,
                        name: true,
                        priceDelta: true
                    }
                },
                products: {
                    where: {
                        isActive: true
                    },
                    orderBy: {
                        name: "asc"
                    },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        imageUrl: true,
                        basePrice: true,
                        badge: true,
                        variants: {
                            select: {
                                id: true,
                                name: true,
                                priceDelta: true
                            }
                        }
                    }
                }
            }
        });

        return {
            tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                phone: tenant.phone,
                deliveryFee: tenant.deliveryFee,
                logoUrl: tenant.logoUrl,
                bannerUrl: tenant.bannerUrl,
                faviconUrl: tenant.faviconUrl,
                description: tenant.description,
                address: tenant.address,
                instagramUrl: tenant.instagramUrl,
                minimumOrderValue: tenant.minimumOrderValue,
                businessHours: tenant.businessHours
            },
            categories
        };
    }
}

export { GetStoreMenuService };
