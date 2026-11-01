import { PosItemNotFoundError, PosTableNotOpenError } from "../../errors/pos/PosErrors.js";
import prismaClient from "../../prisma/index.js";
import { assertPosPlan } from "./assertPosPlan.js";
import { loadPosTableDetail, lockPosOrder, recalculateTableTotals } from "./posTableHelpers.js";

interface RemovePosTableItemServiceProps {
    tenantId: string;
    tableId: string;
    itemId: string;
}

class RemovePosTableItemService {
    async execute({ tenantId, tableId, itemId }: RemovePosTableItemServiceProps) {

        await assertPosPlan(tenantId);

        return prismaClient.$transaction(async (tx) => {
            const status = await lockPosOrder(tx, tenantId, tableId);

            if (status !== "aberta") {
                throw new PosTableNotOpenError();
            }

            const { count } = await tx.orderItem.deleteMany({
                where: { id: itemId, orderId: tableId }
            });

            if (count === 0) {
                throw new PosItemNotFoundError();
            }

            await recalculateTableTotals(tx, tableId);

            return loadPosTableDetail(tx, tenantId, tableId);
        });
    }
}

export { RemovePosTableItemService };
