import { ProductExtraNotFoundError, ProductNotFoundError } from "../../errors/product/ProductErrors.js";
import prismaClient from "../../prisma/index.js";

interface UpdateProductExtraServiceProps {
    tenantId: string;
    productId: string;
    extraId: string;
    name?: string | undefined;
    price?: number | undefined;
}

class UpdateProductExtraService {
    async execute({ tenantId, productId, extraId, name, price }: UpdateProductExtraServiceProps) {

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

        const updated = await prismaClient.productExtra.update({
            where: {
                id: extra.id
            },
            data: {
                ...(name === undefined ? {} : { name }),
                ...(price === undefined ? {} : { price }),
            },
            select: {
                id: true,
                productId: true,
                name: true,
                price: true
            }
        });

        return updated;
    }
}

export { UpdateProductExtraService };
