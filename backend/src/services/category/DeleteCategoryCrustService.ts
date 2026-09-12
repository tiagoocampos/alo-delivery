import { CategoryCrustNotFoundError, CategoryNotFoundError } from "../../errors/category/CategoryErrors.js";
import prismaClient from "../../prisma/index.js";

interface DeleteCategoryCrustServiceProps {
    tenantId: string;
    categoryId: string;
    crustId: string;
}

class DeleteCategoryCrustService {
    async execute({ tenantId, categoryId, crustId }: DeleteCategoryCrustServiceProps) {

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

        await prismaClient.categoryCrust.delete({
            where: {
                id: crust.id
            }
        });

        return { id: crust.id };
    }
}

export { DeleteCategoryCrustService };
