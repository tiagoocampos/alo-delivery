import { ProductImportPlanRequiredError } from "../../errors/product/ProductImportErrors.js";
import prismaClient from "../../prisma/index.js";
import { getEffectivePlan } from "../../utils/subscriptionPlan.js";

// Importar cardápio com IA é recurso do plano completo (mesmo getEffectivePlan
// que decide PDV, fidelidade e push no resto do projeto).
export async function assertImportPlan(tenantId: string) {
    const subscription = await prismaClient.subscription.findUnique({
        where: { tenantId },
        select: { status: true, monthlyPrice: true, startedAt: true }
    });

    if (getEffectivePlan(subscription) === "basico") {
        throw new ProductImportPlanRequiredError();
    }
}
