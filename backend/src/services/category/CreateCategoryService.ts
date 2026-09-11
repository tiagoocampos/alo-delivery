import prismaClient from "../../prisma/index.js";

interface CreateCategoryServiceProps {
    tenantId: string;
    name: string;
    sortOrder?: number | undefined;
}

class CreateCategoryService {
    async execute({ tenantId, name, sortOrder }: CreateCategoryServiceProps) {

        const category = await prismaClient.category.create({
            data: {
                tenantId,
                name,
                sortOrder: sortOrder ?? 0,
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

        return category;
    }
}

export { CreateCategoryService };
