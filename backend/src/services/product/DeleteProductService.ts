import { ProductNotFoundError } from "../../errors/product/ProductErrors.js";
import prismaClient from "../../prisma/index.js";

interface DeleteProductServiceProps {
    tenantId: string;
    productId: string;
}

class DeleteProductService {
    async execute({ tenantId, productId }: DeleteProductServiceProps) {

        const product = await prismaClient.product.findFirst({
            where: {
                id: productId,
                tenantId
            }
        });

        if (!product) {
            throw new ProductNotFoundError();
        }

        // Soft delete: OrderItem de pedidos antigos continua apontando pro produto.
        const deleted = await prismaClient.product.update({
            where: {
                id: product.id
            },
            data: {
                isActive: false
            },
            select: {
                id: true,
                name: true,
                isActive: true
            }
        });

        return deleted;
    }
}

export { DeleteProductService };
