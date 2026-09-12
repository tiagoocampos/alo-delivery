import { CategoryNotFoundError, CategorySizeNotFoundError } from "../../errors/category/CategoryErrors.js";
import prismaClient from "../../prisma/index.js";

interface UpdateCategorySizeServiceProps {
    tenantId: string;
    categoryId: string;
    sizeId: string;
    name?: string | undefined;
    price?: number | undefined;
    maxFlavors?: number | undefined;
}

class UpdateCategorySizeService {
    async execute({ tenantId, categoryId, sizeId, name, price, maxFlavors }: UpdateCategorySizeServiceProps) {

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

        const updated = await prismaClient.categorySize.update({
            where: {
                id: size.id
            },
            data: {
                ...(name === undefined ? {} : { name }),
                ...(price === undefined ? {} : { price }),
                ...(maxFlavors === undefined ? {} : { maxFlavors }),
            },
            select: {
                id: true,
                categoryId: true,
                name: true,
                price: true,
                maxFlavors: true
            }
        });

        return updated;
    }
}

export { UpdateCategorySizeService };
