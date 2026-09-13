// Script único de backfill — normaliza telefones já gravados no banco pro
// mesmo formato que a validação nova passa a exigir (só dígitos), pra não
// deixar cadastros antigos "presos" num formato que não bate mais com login/
// fidelidade/pedido novo da mesma pessoa. Rodar uma vez com:
//   npx tsx src/scripts/normalizePhones.ts
import prismaClient from "../prisma/index.js";
import { normalizePhone } from "../utils/phone.js";

async function normalizeTenants() {
    const tenants = await prismaClient.tenant.findMany({
        where: { phone: { not: null } },
        select: { id: true, phone: true }
    });

    let updated = 0;
    for (const tenant of tenants) {
        const normalized = normalizePhone(tenant.phone!);
        if (normalized !== tenant.phone) {
            await prismaClient.tenant.update({ where: { id: tenant.id }, data: { phone: normalized } });
            updated++;
        }
    }
    console.log(`tenants (users): ${updated} atualizado(s) de ${tenants.length}`);
}

async function normalizeOrders() {
    const orders = await prismaClient.order.findMany({ select: { id: true, customerPhone: true } });

    let updated = 0;
    for (const order of orders) {
        const normalized = normalizePhone(order.customerPhone);
        if (normalized !== order.customerPhone) {
            await prismaClient.order.update({ where: { id: order.id }, data: { customerPhone: normalized } });
            updated++;
        }
    }
    console.log(`orders: ${updated} atualizado(s) de ${orders.length}`);
}

// customers e loyalty_points têm unique(tenantId, telefone) — se duas linhas
// já existirem pro mesmo tenant com formatações diferentes do mesmo número
// (exatamente o bug que estamos corrigindo), elas colidem ao normalizar.
// Reporta o conflito e pula em vez de decidir sozinho como mesclar.
async function normalizeCustomers() {
    const customers = await prismaClient.customer.findMany({
        select: { id: true, tenantId: true, phone: true }
    });

    const groups = new Map<string, typeof customers>();
    for (const customer of customers) {
        const key = `${customer.tenantId}:${normalizePhone(customer.phone)}`;
        const group = groups.get(key) ?? [];
        group.push(customer);
        groups.set(key, group);
    }

    let updated = 0;
    let conflicts = 0;
    for (const [key, group] of groups) {
        const normalized = key.split(":")[1]!;

        if (group.length > 1) {
            conflicts++;
            console.warn(
                `CONFLITO customers em ${key}: ${group.map(c => `${c.id} ("${c.phone}")`).join(" vs ")} — não normalizado, resolva manualmente`
            );
            continue;
        }

        const customer = group[0]!;
        if (customer.phone !== normalized) {
            await prismaClient.customer.update({ where: { id: customer.id }, data: { phone: normalized } });
            updated++;
        }
    }
    console.log(`customers: ${updated} atualizado(s), ${conflicts} conflito(s) pulado(s)`);
}

async function normalizeLoyaltyPoints() {
    const points = await prismaClient.loyaltyPoint.findMany({
        select: { id: true, tenantId: true, customerPhone: true, points: true }
    });

    const groups = new Map<string, typeof points>();
    for (const point of points) {
        const key = `${point.tenantId}:${normalizePhone(point.customerPhone)}`;
        const group = groups.get(key) ?? [];
        group.push(point);
        groups.set(key, group);
    }

    let updated = 0;
    let conflicts = 0;
    for (const [key, group] of groups) {
        const normalized = key.split(":")[1]!;

        if (group.length > 1) {
            conflicts++;
            console.warn(
                `CONFLITO loyalty_points em ${key}: ${group.map(p => `${p.id} ("${p.customerPhone}", ${p.points}pt)`).join(" vs ")} — não normalizado, resolva manualmente`
            );
            continue;
        }

        const point = group[0]!;
        if (point.customerPhone !== normalized) {
            await prismaClient.loyaltyPoint.update({ where: { id: point.id }, data: { customerPhone: normalized } });
            updated++;
        }
    }
    console.log(`loyalty_points: ${updated} atualizado(s), ${conflicts} conflito(s) pulado(s)`);
}

async function main() {
    await normalizeTenants();
    await normalizeOrders();
    await normalizeCustomers();
    await normalizeLoyaltyPoints();
    await prismaClient.$disconnect();
}

main().catch(async (error) => {
    console.error(error);
    await prismaClient.$disconnect();
    process.exit(1);
});
