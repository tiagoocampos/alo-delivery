import { PosPlanRequiredError } from "../../errors/pos/PosErrors.js";
import prismaClient from "../../prisma/index.js";
import { getEffectivePlan } from "../../utils/subscriptionPlan.js";

// PDV de balcão é recurso do plano completo (mesmo getEffectivePlan que
// decide fidelidade e push no resto do projeto).
export async function assertPosPlan(tenantId: string) {
    const subscription = await prismaClient.subscription.findUnique({
        where: { tenantId },
        select: { status: true, monthlyPrice: true, startedAt: true }
    });

    if (getEffectivePlan(subscription) === "basico") {
        throw new PosPlanRequiredError();
    }
}

// Limite do tipo Int do Postgres (centavos) — passando disso o UPDATE estouraria.
export const MAX_POS_TOTAL = 2_000_000_000;
