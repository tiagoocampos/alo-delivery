import { ProductNotFoundError } from "../../errors/product/ProductErrors.js";
import prismaClient from "../../prisma/index.js";

interface CreateProductExtraServiceProps {
    tenantId: string;
    productId: string;
    name: string;
    price: number;
}

class CreateProductExtraService {
    async execute({ tenantId, productId, name, price }: CreateProductExtraServiceProps) {

        const product = await prismaClient.product.findFirst({
            where: {
                id: productId,
                tenantId
            }
        });

        if (!product) {
            throw new ProductNotFoundError();
        }

        const extra = await prismaClient.productExtra.create({
            data: {
                productId: product.id,
                name,
                price
            },
            select: {
                id: true,
                productId: true,
                name: true,
                price: true
            }
        });

        return extra;
    }
}

export { CreateProductExtraService };
