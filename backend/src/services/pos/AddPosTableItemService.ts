import { PosTableItemLimitReachedError, PosTableNotOpenError } from "../../errors/pos/PosErrors.js";
import prismaClient from "../../prisma/index.js";
import { assertPosPlan } from "./assertPosPlan.js";
import { buildPosItems, toOrderItemCreate, type PosItemInput } from "./buildPosItems.js";
import {
    loadPosTableDetail,
    lockPosOrder,
    MAX_TABLE_ITEMS,
    recalculateTableTotals
} from "./posTableHelpers.js";

interface AddPosTableItemServiceProps {
    tenantId: string;
    tableId: string;
    item: PosItemInput;
}

const MAX_LINE_QUANTITY = 99;

class AddPosTableItemService {
    async execute({ tenantId, tableId, item }: AddPosTableItemServiceProps) {

        await assertPosPlan(tenantId);

        // Preço e nome congelados aqui, no momento em que o item entra na mesa.
        const [built] = await buildPosItems(tenantId, [item]);

        return prismaClient.$transaction(async (tx) => {
            const status = await lockPosOrder(tx, tenantId, tableId);

            if (status !== "aberta") {
                throw new PosTableNotOpenError();
            }

            const lines = await tx.orderItem.findMany({
                where: { orderId: tableId },
                select: {
                    id: true,
                    productId: true,
                    variantId: true,
                    quantity: true,
                    unitPrice: true,
                    extras: { select: { productExtraId: true } }
                }
            });

            // Linha idêntica (mesmo produto, variante e extras) soma quantidade.
            // Só junta se o preço congelado da linha for o mesmo: se o cadastro
            // mudou de preço no meio da conta, vira linha nova com o preço novo.
            // Item avulso sempre vira linha nova.
            const extrasKey = (ids: string[]) => [...ids].sort().join(",");
            const builtExtrasKey = extrasKey(built!.extras.map(extra => extra.productExtraId));

            const sameLine = built!.productId === null ? undefined : lines.find(line =>
                line.productId === built!.productId &&
                line.variantId === built!.variantId &&
                line.unitPrice === built!.unitPrice &&
                extrasKey(line.extras.map(extra => extra.productExtraId)) === builtExtrasKey &&
                line.quantity + built!.quantity <= MAX_LINE_QUANTITY
            );

            if (sameLine) {
                await tx.orderItem.update({
                    where: { id: sameLine.id },
                    data: { quantity: { increment: built!.quantity } }
                });
            } else {
                if (lines.length >= MAX_TABLE_ITEMS) {
                    throw new PosTableItemLimitReachedError(MAX_TABLE_ITEMS);
                }

                await tx.orderItem.create({
                    data: {
                        orderId: tableId,
                        ...toOrderItemCreate(built!)
                    }
                });
            }

            await recalculateTableTotals(tx, tableId);

            return loadPosTableDetail(tx, tenantId, tableId);
        });
    }
}

export { AddPosTableItemService };
