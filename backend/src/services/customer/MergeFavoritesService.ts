import prismaClient from "../../prisma/index.js";
import {
    listFavoriteIds,
    MAX_FAVORITES_PER_CUSTOMER,
    resolveFavoritesTenant,
    visibleProductWhere
} from "./favorites.js";

interface MergeFavoritesServiceProps {
    slug: string;
    productIds: string[];
    customerId: string;
    customerTenantId: string;
}

class MergeFavoritesService {
    // União dos favoritos do aparelho com os da conta. Id inválido, de outra
    // loja ou inativo é ignorado sem erro. Passando do limite, entram só os
    // que cabem (a ordem da lista enviada decide) e o resto é descartado.
    async execute({ slug, productIds, customerId, customerTenantId }: MergeFavoritesServiceProps) {
        const tenant = await resolveFavoritesTenant(slug, customerTenantId);

        const requested = [...new Set(productIds)];

        const [validProducts, existing] = await Promise.all([
            prismaClient.product.findMany({
                where: { id: { in: requested }, ...visibleProductWhere(tenant.id) },
                select: { id: true }
            }),
            prismaClient.customerFavorite.findMany({
                where: { customerId },
                select: { productId: true }
            })
        ]);

        const existingIds = new Set(existing.map((favorite) => favorite.productId));
        const validIds = new Set(validProducts.map((product) => product.id));

        const room = Math.max(0, MAX_FAVORITES_PER_CUSTOMER - existingIds.size);
        const toAdd = requested.filter((id) => validIds.has(id) && !existingIds.has(id)).slice(0, room);

        if (toAdd.length > 0) {
            await prismaClient.customerFavorite.createMany({
                data: toAdd.map((productId) => ({ customerId, productId })),
                skipDuplicates: true
            });
        }

        return { productIds: await listFavoriteIds(customerId, tenant.id) };
    }
}

export { MergeFavoritesService };
