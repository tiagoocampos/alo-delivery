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
                isActive: true
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
                deliveryFee: tenant.deliveryFee
            },
            categories
        };
    }
}

export { GetStoreMenuService };
