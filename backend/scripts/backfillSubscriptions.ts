// Script único: dá Subscription (status "trial") a todo tenant que já existe
// e ainda não tem nenhuma. Sem isso, getEffectivePlan trata esses tenants
// como sem assinatura cadastrada e sempre retorna "completo", nunca contando
// o trial de 30 dias.
//
// startedAt usa tenant.createdAt — o trial desses tenants já existentes conta
// a partir de quando eles realmente começaram a usar o sistema, não a partir
// de hoje.
//
// Uso: npx tsx scripts/backfillSubscriptions.ts

import prismaClient from "../src/prisma/index.js";

const FULL_PLAN_MONTHLY_PRICE = 4990;

async function main() {
    const tenantsWithoutSubscription = await prismaClient.tenant.findMany({
        where: { subscription: null },
        select: { id: true, name: true, createdAt: true }
    });

    if (tenantsWithoutSubscription.length === 0) {
        console.log("Nenhum tenant sem Subscription encontrado.");
        process.exit(0);
    }

    console.log(`Encontrados ${tenantsWithoutSubscription.length} tenant(s) sem Subscription:`);
    for (const tenant of tenantsWithoutSubscription) {
        console.log(`- ${tenant.name} (${tenant.id}), criado em ${tenant.createdAt.toISOString()}`);
    }

    for (const tenant of tenantsWithoutSubscription) {
        await prismaClient.subscription.create({
            data: {
                tenantId: tenant.id,
                planName: "Completo",
                monthlyPrice: FULL_PLAN_MONTHLY_PRICE,
                status: "trial",
                startedAt: tenant.createdAt
            }
        });
    }

    console.log(`Subscription criada para ${tenantsWithoutSubscription.length} tenant(s).`);
    process.exit(0);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
