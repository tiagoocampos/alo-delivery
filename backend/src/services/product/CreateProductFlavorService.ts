import { ProductNotFoundError } from "../../errors/product/ProductErrors.js";
import prismaClient from "../../prisma/index.js";

interface CreateProductFlavorServiceProps {
    tenantId: string;
    productId: string;
    name: string;
}

class CreateProductFlavorService {
    async execute({ tenantId, productId, name }: CreateProductFlavorServiceProps) {

        const product = await prismaClient.product.findFirst({
            where: {
                id: productId,
                tenantId
            }
        });

        if (!product) {
            throw new ProductNotFoundError();
        }

        const flavor = await prismaClient.productFlavor.create({
            data: {
                productId: product.id,
                name
            },
            select: {
                id: true,
                productId: true,
                name: true
            }
        });

        return flavor;
    }
}

export { CreateProductFlavorService };
