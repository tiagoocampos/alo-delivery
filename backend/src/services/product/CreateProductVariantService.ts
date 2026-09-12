import { ProductNotFoundError } from "../../errors/product/ProductErrors.js";
import prismaClient from "../../prisma/index.js";

interface CreateProductVariantServiceProps {
    tenantId: string;
    productId: string;
    name: string;
    priceDelta?: number | undefined;
}

class CreateProductVariantService {
    async execute({ tenantId, productId, name, priceDelta }: CreateProductVariantServiceProps) {

        const product = await prismaClient.product.findFirst({
            where: {
                id: productId,
                tenantId
            }
        });

        if (!product) {
            throw new ProductNotFoundError();
        }

        const variant = await prismaClient.productVariant.create({
            data: {
                productId: product.id,
                name,
                priceDelta: priceDelta ?? 0
            },
            select: {
                id: true,
                productId: true,
                name: true,
                priceDelta: true
            }
        });

        return variant;
    }
}

export { CreateProductVariantService };
