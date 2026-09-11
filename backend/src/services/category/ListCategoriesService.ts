import prismaClient from "../../prisma/index.js";

interface ListCategoriesServiceProps {
    tenantId: string;
}

class ListCategoriesService {
    async execute({ tenantId }: ListCategoriesServiceProps) {

        const categories = await prismaClient.category.findMany({
            where: {
                tenantId
            },
            orderBy: [
                { sortOrder: "asc" },
                { name: "asc" }
            ],
            select: {
                id: true,
                tenantId: true,
                name: true,
                sortOrder: true,
                isActive: true,
                createdAt: true
            }
        });

        return categories;
    }
}

export { ListCategoriesService };
