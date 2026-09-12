import prismaClient from "../../prisma/index.js";

interface ListProductsServiceProps {
    tenantId: string;
    categoryId?: string | undefined;
    isActive?: boolean | undefined;
}

class ListProductsService {
    async execute({ tenantId, categoryId, isActive }: ListProductsServiceProps) {

        const products = await prismaClient.product.findMany({
            where: {
                tenantId,
                ...(categoryId ? { categoryId } : {}),
                ...(isActive === undefined ? {} : { isActive }),
            },
            orderBy: {
                createdAt: "desc"
            },
            select: {
                id: true,
                tenantId: true,
                categoryId: true,
                name: true,
                description: true,
                imageUrl: true,
                basePrice: true,
                isActive: true,
                badge: true,
                createdAt: true,
                updatedAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        sortOrder: true
                    }
                },
                variants: {
                    select: {
                        id: true,
                        name: true,
                        priceDelta: true,
                        maxFlavors: true
                    }
                },
                flavors: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                crusts: {
                    select: {
                        id: true,
                        name: true,
                        priceDelta: true
                    }
                }
            }
        });

        return products;
    }
}

export { ListProductsService };
