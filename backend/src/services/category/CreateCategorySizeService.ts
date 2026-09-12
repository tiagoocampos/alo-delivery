import { CategoryNotFoundError } from "../../errors/category/CategoryErrors.js";
import prismaClient from "../../prisma/index.js";

interface CreateCategorySizeServiceProps {
    tenantId: string;
    categoryId: string;
    name: string;
    price: number;
    maxFlavors: number;
}

class CreateCategorySizeService {
    async execute({ tenantId, categoryId, name, price, maxFlavors }: CreateCategorySizeServiceProps) {

        const category = await prismaClient.category.findFirst({
            where: {
                id: categoryId,
                tenantId
            }
        });

        if (!category) {
            throw new CategoryNotFoundError();
        }

        const size = await prismaClient.categorySize.create({
            data: {
                categoryId: category.id,
                name,
                price,
                maxFlavors
            },
            select: {
                id: true,
                categoryId: true,
                name: true,
                price: true,
                maxFlavors: true
            }
        });

        return size;
    }
}

export { CreateCategorySizeService };
