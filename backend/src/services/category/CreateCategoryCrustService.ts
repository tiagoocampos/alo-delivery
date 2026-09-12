import { CategoryNotFoundError } from "../../errors/category/CategoryErrors.js";
import prismaClient from "../../prisma/index.js";

interface CreateCategoryCrustServiceProps {
    tenantId: string;
    categoryId: string;
    name: string;
    priceDelta?: number | undefined;
}

class CreateCategoryCrustService {
    async execute({ tenantId, categoryId, name, priceDelta }: CreateCategoryCrustServiceProps) {

        const category = await prismaClient.category.findFirst({
            where: {
                id: categoryId,
                tenantId
            }
        });

        if (!category) {
            throw new CategoryNotFoundError();
        }

        const crust = await prismaClient.categoryCrust.create({
            data: {
                categoryId: category.id,
                name,
                priceDelta: priceDelta ?? 0
            },
            select: {
                id: true,
                categoryId: true,
                name: true,
                priceDelta: true
            }
        });

        return crust;
    }
}

export { CreateCategoryCrustService };
