import { CategoryNotFoundError } from "../../errors/category/CategoryErrors.js";
import prismaClient from "../../prisma/index.js";

interface UpdateCategoryServiceProps {
    tenantId: string;
    categoryId: string;
    name?: string;
    sortOrder?: number;
    isActive?: boolean;
}

class UpdateCategoryService {
    async execute({ tenantId, categoryId, name, sortOrder, isActive }: UpdateCategoryServiceProps) {

        const category = await prismaClient.category.findFirst({
            where: {
                id: categoryId,
                tenantId
            }
        });

        if (!category) {
            throw new CategoryNotFoundError();
        }

        const updated = await prismaClient.category.update({
            where: {
                id: category.id
            },
            data: {
                ...(name !== undefined && { name }),
                ...(sortOrder !== undefined && { sortOrder }),
                ...(isActive !== undefined && { isActive })
            },
            select: {
                id: true,
                tenantId: true,
                name: true,
                sortOrder: true,
                isActive: true,
                createdAt: true
            }
        });

        return updated;
    }
}

export { UpdateCategoryService };
