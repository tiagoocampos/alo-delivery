import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";
import type { SubscriptionStatus } from "../../generated/prisma/enums.js";

interface UpsertSubscriptionServiceProps {
    tenantId: string;
    planName: string;
    monthlyPrice: number;
    status: SubscriptionStatus;
}

class UpsertSubscriptionService {
    async execute({ tenantId, planName, monthlyPrice, status }: UpsertSubscriptionServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: { id: tenantId },
            select: { id: true }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        // canceledAt é derivado do status, não vem no corpo da requisição —
        // é a única forma consistente de manter esse campo coerente com "status".
        const canceledAt = status === "canceled" ? new Date() : null;

        const subscription = await prismaClient.subscription.upsert({
            where: { tenantId },
            create: {
                tenantId,
                planName,
                monthlyPrice,
                status,
                canceledAt
            },
            update: {
                planName,
                monthlyPrice,
                status,
                canceledAt
            },
            select: {
                id: true,
                tenantId: true,
                planName: true,
                monthlyPrice: true,
                status: true,
                startedAt: true,
                canceledAt: true
            }
        });

        return subscription;
    }
}

export { UpsertSubscriptionService };
