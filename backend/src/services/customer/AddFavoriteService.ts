import { FavoriteLimitReachedError } from "../../errors/customer/CustomerErrors.js";
import { ProductUnavailableError } from "../../errors/order/OrderErrors.js";
import prismaClient from "../../prisma/index.js";
import {
    listFavoriteIds,
    MAX_FAVORITES_PER_CUSTOMER,
    resolveFavoritesTenant,
    visibleProductWhere
} from "./favorites.js";

interface AddFavoriteServiceProps {
    slug: string;
    productId: string;
    customerId: string;
    customerTenantId: string;
}

class AddFavoriteService {
    async execute({ slug, productId, customerId, customerTenantId }: AddFavoriteServiceProps) {
        const tenant = await resolveFavoritesTenant(slug, customerTenantId);

        // Produto de outra loja, inativo ou só de balcão = indisponível.
        const product = await prismaClient.product.findFirst({
            where: { id: productId, ...visibleProductWhere(tenant.id) },
            select: { id: true }
        });

        if (!product) {
            throw new ProductUnavailableError(productId);
        }

        const alreadyFavorite = await prismaClient.customerFavorite.findUnique({
            where: { customerId_productId: { customerId, productId } },
            select: { id: true }
        });

        if (!alreadyFavorite) {
            const total = await prismaClient.customerFavorite.count({ where: { customerId } });

            if (total >= MAX_FAVORITES_PER_CUSTOMER) {
                throw new FavoriteLimitReachedError();
            }

            // skipDuplicates cobre duas chamadas simultâneas do mesmo produto.
            await prismaClient.customerFavorite.createMany({
                data: [{ customerId, productId }],
                skipDuplicates: true
            });
        }

        return { productIds: await listFavoriteIds(customerId, tenant.id) };
    }
}

export { AddFavoriteService };
