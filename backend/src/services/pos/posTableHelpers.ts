import { OrderNotFoundError } from "../../errors/order/OrderErrors.js";
import { PosSaleTotalTooHighError } from "../../errors/pos/PosErrors.js";
import prismaClient from "../../prisma/index.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type { OrderStatus } from "../../generated/prisma/enums.js";
import { MAX_POS_TOTAL } from "./assertPosPlan.js";
import { sumPosItems } from "./buildPosItems.js";

export type PosTx = Prisma.TransactionClient;

export const MAX_OPEN_TABLES = 100;
export const MAX_TABLE_ITEMS = 200;

// Trava a linha da mesa até o fim da transação. Sem isso, dois "adicionar
// item" (ou "adicionar" + "fechar") simultâneos recalculariam o total cada um
// sem enxergar o item do outro e o último a gravar venceria com total errado.
// Também garante o escopo: só mesa/venda de balcão do tenant, senão 404.
export async function lockPosOrder(tx: PosTx, tenantId: string, orderId: string): Promise<OrderStatus> {
    const rows = await tx.$queryRaw<{ status: OrderStatus }[]>`
        SELECT status::text AS status
        FROM orders
        WHERE id = ${orderId} AND tenant_id = ${tenantId} AND origin = 'balcao'
        FOR UPDATE
    `;

    if (rows.length === 0) {
        throw new OrderNotFoundError();
    }

    return rows[0]!.status;
}

// O total da mesa sempre é recalculado a partir dos itens gravados.
export async function recalculateTableTotals(tx: PosTx, orderId: string) {
    const items = await tx.orderItem.findMany({
        where: { orderId },
        select: { unitPrice: true, quantity: true }
    });

    const subtotal = sumPosItems(items);

    if (subtotal > MAX_POS_TOTAL) {
        throw new PosSaleTotalTooHighError();
    }

    await tx.order.update({
        where: { id: orderId },
        data: { subtotal, total: subtotal }
    });

    return subtotal;
}

export const posTableDetailSelect = {
    id: true,
    tableLabel: true,
    status: true,
    createdAt: true,
    closedAt: true,
    paymentMethod: true,
    subtotal: true,
    total: true,
    items: {
        orderBy: { id: "asc" },
        select: {
            id: true,
            name: true,
            quantity: true,
            unitPrice: true,
            extras: {
                select: {
                    name: true,
                    price: true
                }
            }
        }
    }
} as const;

// Detalhe de mesa (aberta, fechada ou cancelada) no formato do contrato.
export async function loadPosTableDetail(tx: PosTx | typeof prismaClient, tenantId: string, orderId: string) {
    const order = await tx.order.findFirst({
        where: { id: orderId, tenantId, origin: "balcao" },
        select: posTableDetailSelect
    });

    if (!order) {
        throw new OrderNotFoundError();
    }

    const { tableLabel, createdAt, ...rest } = order;

    return {
        id: rest.id,
        label: tableLabel,
        status: rest.status,
        openedAt: createdAt,
        closedAt: rest.closedAt,
        paymentMethod: rest.paymentMethod,
        subtotal: rest.subtotal,
        total: rest.total,
        items: rest.items
    };
}
