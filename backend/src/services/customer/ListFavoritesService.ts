import { listFavoriteIds, resolveFavoritesTenant } from "./favorites.js";

interface ListFavoritesServiceProps {
    slug: string;
    customerId: string;
    customerTenantId: string;
}

class ListFavoritesService {
    async execute({ slug, customerId, customerTenantId }: ListFavoritesServiceProps) {
        const tenant = await resolveFavoritesTenant(slug, customerTenantId);

        return { productIds: await listFavoriteIds(customerId, tenant.id) };
    }
}

export { ListFavoritesService };
