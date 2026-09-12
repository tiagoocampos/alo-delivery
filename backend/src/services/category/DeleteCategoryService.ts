import { CategoryHasProductsError, CategoryNotFoundError } from "../../errors/category/CategoryErrors.js";
import prismaClient from "../../prisma/index.js";

interface DeleteCategoryServiceProps {
    tenantId: string;
    categoryId: string;
}

class DeleteCategoryService {
    async execute({ tenantId, categoryId }: DeleteCategoryServiceProps) {

        const category = await prismaClient.category.findFirst({
            where: {
                id: categoryId,
                tenantId
            }
        });

        if (!category) {
            throw new CategoryNotFoundError();
        }

        const productsCount = await prismaClient.product.count({
            where: {
                categoryId: category.id
            }
        });

        if (productsCount > 0) {
            throw new CategoryHasProductsError();
        }

        // const deleted = await prismaClient.category.update({
        //     where: {
        //         id: category.id
        //     },
        //     data: {
        //         isActive: false
        //     },
        //     select: {
        //         id: true,
        //         name: true,
        //         isActive: true
        //     }
        // });

        const deleted = await prismaClient.category.delete({
            where: {
                id: category.id
            }
        });

        return deleted;


    }
}

export { DeleteCategoryService };