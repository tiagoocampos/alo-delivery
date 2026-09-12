import { CategoryCrustNotFoundError, CategoryNotFoundError } from "../../errors/category/CategoryErrors.js";
import prismaClient from "../../prisma/index.js";

interface UpdateCategoryCrustServiceProps {
    tenantId: string;
    categoryId: string;
    crustId: string;
    name?: string | undefined;
    priceDelta?: number | undefined;
}

class UpdateCategoryCrustService {
    async execute({ tenantId, categoryId, crustId, name, priceDelta }: UpdateCategoryCrustServiceProps) {

        const category = await prismaClient.category.findFirst({
            where: {
                id: categoryId,
                tenantId
            }
        });

        if (!category) {
            throw new CategoryNotFoundError();
        }

        const crust = await prismaClient.categoryCrust.findFirst({
            where: {
                id: crustId,
                categoryId: category.id
            }
        });

        if (!crust) {
            throw new CategoryCrustNotFoundError();
        }

        const updated = await prismaClient.categoryCrust.update({
            where: {
                id: crust.id
            },
            data: {
                ...(name === undefined ? {} : { name }),
                ...(priceDelta === undefined ? {} : { priceDelta }),
            },
            select: {
                id: true,
                categoryId: true,
                name: true,
                priceDelta: true
            }
        });

        return updated;
    }
}

export { UpdateCategoryCrustService };
