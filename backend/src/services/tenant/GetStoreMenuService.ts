import { TenantInactiveError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";
import { resolveTenantOrThrow } from "./resolveTenantOrThrow.js";

interface GetStoreMenuServiceProps {
    slug: string;
}

class GetStoreMenuService {
    async execute({ slug }: GetStoreMenuServiceProps) {

        const tenant = await resolveTenantOrThrow({ slug });

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
                // Usado só pra esconder categoria que ficou vazia por causa do
                // filtro de disponibilidade (não vai pra resposta).
                _count: {
                    select: {
                        products: { where: { isActive: true, availability: "balcao" } }
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
                        isActive: true,
                        // Produto só de balcão nunca aparece no storefront.
                        availability: { in: ["ambos", "delivery"] }
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
                        ingredients: true,
                        variants: {
                            select: {
                                id: true,
                                name: true,
                                priceDelta: true
                            }
                        },
                        extras: {
                            select: {
                                id: true,
                                name: true,
                                price: true
                            }
                        }
                    }
                }
            }
        });

        // Categoria que só tem itens de balcão não aparece vazia no storefront.
        // Categoria que já era vazia antes continua aparecendo, como sempre.
        const visibleCategories = categories
            .filter(category => category.products.length > 0 || category._count.products === 0)
            .map(({ _count, ...category }) => category);

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
                pixKey: tenant.pixKey,
                minimumOrderValue: tenant.minimumOrderValue,
                businessHours: tenant.businessHours,
                effectivePlan: tenant.effectivePlan
            },
            categories: visibleCategories
        };
    }
}

export { GetStoreMenuService };
