import { PosItemNotFoundError, PosTableNotOpenError } from "../../errors/pos/PosErrors.js";
import prismaClient from "../../prisma/index.js";
import { assertPosPlan } from "./assertPosPlan.js";
import { loadPosTableDetail, lockPosOrder, recalculateTableTotals } from "./posTableHelpers.js";

interface UpdatePosTableItemServiceProps {
    tenantId: string;
    tableId: string;
    itemId: string;
    quantity: number;
}

class UpdatePosTableItemService {
    async execute({ tenantId, tableId, itemId, quantity }: UpdatePosTableItemServiceProps) {

        await assertPosPlan(tenantId);

        return prismaClient.$transaction(async (tx) => {
            const status = await lockPosOrder(tx, tenantId, tableId);

            if (status !== "aberta") {
                throw new PosTableNotOpenError();
            }

            // Escopo pela mesa: item de outra mesa/tenant cai em 404.
            const { count } = await tx.orderItem.updateMany({
                where: { id: itemId, orderId: tableId },
                data: { quantity }
            });

            if (count === 0) {
                throw new PosItemNotFoundError();
            }

            await recalculateTableTotals(tx, tableId);

            return loadPosTableDetail(tx, tenantId, tableId);
        });
    }
}

export { UpdatePosTableItemService };
