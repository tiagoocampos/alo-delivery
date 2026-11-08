import { CustomerTenantMismatchError } from "../../errors/customer/CustomerErrors.js";
import prismaClient from "../../prisma/index.js";
import { resolveTenantOrThrow } from "../tenant/resolveTenantOrThrow.js";

export const MAX_FAVORITES_PER_CUSTOMER = 100;

// Só entra na lista o que o cliente ainda pode pedir pelo delivery.
export const visibleProductWhere = (tenantId: string) => ({
    tenantId,
    isActive: true,
    availability: { in: ["ambos", "delivery"] as ("ambos" | "delivery")[] }
});

// Resolve a loja pelo slug e confere que o cliente do token é dela.
// customerId/tenantId vêm sempre do token, nunca do corpo ou dos parâmetros.
export async function resolveFavoritesTenant(slug: string, customerTenantId: string) {
    const tenant = await resolveTenantOrThrow({ slug });

    if (customerTenantId !== tenant.id) {
        throw new CustomerTenantMismatchError();
    }

    return tenant;
}

// Favoritos do cliente, do mais recente ao mais antigo, só de produtos visíveis.
export async function listFavoriteIds(customerId: string, tenantId: string): Promise<string[]> {
    const favorites = await prismaClient.customerFavorite.findMany({
        where: { customerId, product: visibleProductWhere(tenantId) },
        orderBy: { createdAt: "desc" },
        select: { productId: true }
    });

    return favorites.map((favorite) => favorite.productId);
}
