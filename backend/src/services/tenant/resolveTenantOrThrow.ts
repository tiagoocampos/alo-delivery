import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import { SubscriptionCanceledError } from "../../errors/subscription/SubscriptionErrors.js";
import prismaClient from "../../prisma/index.js";

interface ResolveTenantOrThrowProps {
    slug: string;
}

// Resolução de tenant por slug compartilhada pelos services públicos da
// loja (storefront) — centraliza a checagem de assinatura cancelada pra não
// duplicar essa lógica em cada service que busca tenant pelo slug. Tenant
// sem Subscription cadastrada não é bloqueado, só status "canceled".
async function resolveTenantOrThrow({ slug }: ResolveTenantOrThrowProps) {

    const tenant = await prismaClient.tenant.findUnique({
        where: {
            slug
        },
        select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            deliveryFee: true,
            isActive: true,
            logoUrl: true,
            bannerUrl: true,
            faviconUrl: true,
            description: true,
            address: true,
            instagramUrl: true,
            pixKey: true,
            minimumOrderValue: true,
            businessHours: true,
            createdAt: true,
            updatedAt: true,
            subscription: {
                select: {
                    status: true
                }
            }
        }
    });

    if (!tenant) {
        throw new TenantNotFoundError();
    }

    if (tenant.subscription?.status === "canceled") {
        throw new SubscriptionCanceledError();
    }

    return tenant;
}

export { resolveTenantOrThrow };
