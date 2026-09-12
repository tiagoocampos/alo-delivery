import { ProductCrustNotFoundError, ProductNotFoundError } from "../../errors/product/ProductErrors.js";
import prismaClient from "../../prisma/index.js";

interface DeleteProductCrustServiceProps {
    tenantId: string;
    productId: string;
    crustId: string;
}

class DeleteProductCrustService {
    async execute({ tenantId, productId, crustId }: DeleteProductCrustServiceProps) {

        const product = await prismaClient.product.findFirst({
            where: {
                id: productId,
                tenantId
            }
        });

        if (!product) {
            throw new ProductNotFoundError();
        }

        const crust = await prismaClient.productCrust.findFirst({
            where: {
                id: crustId,
                productId: product.id
            }
        });

        if (!crust) {
            throw new ProductCrustNotFoundError();
        }

        await prismaClient.productCrust.delete({
            where: {
                id: crust.id
            }
        });

        return { id: crust.id };
    }
}

export { DeleteProductCrustService };
