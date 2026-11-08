import prismaClient from "../../prisma/index.js";
import { listFavoriteIds, resolveFavoritesTenant } from "./favorites.js";

interface RemoveFavoriteServiceProps {
    slug: string;
    productId: string;
    customerId: string;
    customerTenantId: string;
}

class RemoveFavoriteService {
    async execute({ slug, productId, customerId, customerTenantId }: RemoveFavoriteServiceProps) {
        const tenant = await resolveFavoritesTenant(slug, customerTenantId);

        // deleteMany: remover algo que não existe é sucesso, não erro.
        await prismaClient.customerFavorite.deleteMany({ where: { customerId, productId } });

        return { productIds: await listFavoriteIds(customerId, tenant.id) };
    }
}

export { RemoveFavoriteService };
