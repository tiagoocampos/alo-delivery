import { CategoryNotFoundError, CategorySizeNotFoundError } from "../../errors/category/CategoryErrors.js";
import prismaClient from "../../prisma/index.js";

interface DeleteCategorySizeServiceProps {
    tenantId: string;
    categoryId: string;
    sizeId: string;
}

class DeleteCategorySizeService {
    async execute({ tenantId, categoryId, sizeId }: DeleteCategorySizeServiceProps) {

        const category = await prismaClient.category.findFirst({
            where: {
                id: categoryId,
                tenantId
            }
        });

        if (!category) {
            throw new CategoryNotFoundError();
        }

        const size = await prismaClient.categorySize.findFirst({
            where: {
                id: sizeId,
                categoryId: category.id
            }
        });

        if (!size) {
            throw new CategorySizeNotFoundError();
        }

        await prismaClient.categorySize.delete({
            where: {
                id: size.id
            }
        });

        return { id: size.id };
    }
}

export { DeleteCategorySizeService };
