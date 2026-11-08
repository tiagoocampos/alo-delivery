import prismaClient from "../../prisma/index.js";
import type { ProductAvailability } from "../../generated/prisma/enums.js";

interface ListProductsServiceProps {
    tenantId: string;
    categoryId?: string | undefined;
    isActive?: boolean | undefined;
    availability?: ProductAvailability | undefined;
}

class ListProductsService {
    async execute({ tenantId, categoryId, isActive, availability }: ListProductsServiceProps) {

        const products = await prismaClient.product.findMany({
            where: {
                tenantId,
                ...(categoryId ? { categoryId } : {}),
                ...(isActive === undefined ? {} : { isActive }),
                ...(availability ? { availability } : {}),
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
                availability: true,
                ingredients: true,
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
        });

        return products;
    }
}

export { ListProductsService };
