import { ProductExtraNotFoundError, ProductNotFoundError } from "../../errors/product/ProductErrors.js";
import prismaClient from "../../prisma/index.js";

interface DeleteProductExtraServiceProps {
    tenantId: string;
    productId: string;
    extraId: string;
}

class DeleteProductExtraService {
    async execute({ tenantId, productId, extraId }: DeleteProductExtraServiceProps) {

        const product = await prismaClient.product.findFirst({
            where: {
                id: productId,
                tenantId
            }
        });

        if (!product) {
            throw new ProductNotFoundError();
        }

        const extra = await prismaClient.productExtra.findFirst({
            where: {
                id: extraId,
                productId: product.id
            }
        });

        if (!extra) {
            throw new ProductExtraNotFoundError();
        }

        await prismaClient.productExtra.delete({
            where: {
                id: extra.id
            }
        });

        return { id: extra.id };
    }
}

export { DeleteProductExtraService };
