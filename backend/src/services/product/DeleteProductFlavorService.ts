import { ProductFlavorNotFoundError, ProductNotFoundError } from "../../errors/product/ProductErrors.js";
import prismaClient from "../../prisma/index.js";

interface DeleteProductFlavorServiceProps {
    tenantId: string;
    productId: string;
    flavorId: string;
}

class DeleteProductFlavorService {
    async execute({ tenantId, productId, flavorId }: DeleteProductFlavorServiceProps) {

        const product = await prismaClient.product.findFirst({
            where: {
                id: productId,
                tenantId
            }
        });

        if (!product) {
            throw new ProductNotFoundError();
        }

        const flavor = await prismaClient.productFlavor.findFirst({
            where: {
                id: flavorId,
                productId: product.id
            }
        });

        if (!flavor) {
            throw new ProductFlavorNotFoundError();
        }

        await prismaClient.productFlavor.delete({
            where: {
                id: flavor.id
            }
        });

        return { id: flavor.id };
    }
}

export { DeleteProductFlavorService };
