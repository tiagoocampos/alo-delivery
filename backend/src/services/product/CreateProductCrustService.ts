import { ProductNotFoundError } from "../../errors/product/ProductErrors.js";
import prismaClient from "../../prisma/index.js";

interface CreateProductCrustServiceProps {
    tenantId: string;
    productId: string;
    name: string;
    priceDelta?: number | undefined;
}

class CreateProductCrustService {
    async execute({ tenantId, productId, name, priceDelta }: CreateProductCrustServiceProps) {

        const product = await prismaClient.product.findFirst({
            where: {
                id: productId,
                tenantId
            }
        });

        if (!product) {
            throw new ProductNotFoundError();
        }

        const crust = await prismaClient.productCrust.create({
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

        return crust;
    }
}

export { CreateProductCrustService };
