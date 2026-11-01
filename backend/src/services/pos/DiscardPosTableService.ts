import { PosTableNotEmptyError, PosTableNotOpenError } from "../../errors/pos/PosErrors.js";
import prismaClient from "../../prisma/index.js";
import { assertPosPlan } from "./assertPosPlan.js";
import { lockPosOrder } from "./posTableHelpers.js";

interface DiscardPosTableServiceProps {
    tenantId: string;
    tableId: string;
}

// Descarta mesa aberta e vazia (apaga o registro). Com itens, o caminho é o
// cancelamento pelo dono.
class DiscardPosTableService {
    async execute({ tenantId, tableId }: DiscardPosTableServiceProps) {

        await assertPosPlan(tenantId);

        await prismaClient.$transaction(async (tx) => {
            const status = await lockPosOrder(tx, tenantId, tableId);

            if (status !== "aberta") {
                throw new PosTableNotOpenError();
            }

            const itemsCount = await tx.orderItem.count({ where: { orderId: tableId } });

            if (itemsCount > 0) {
                throw new PosTableNotEmptyError();
            }

            await tx.order.delete({ where: { id: tableId } });
        });
    }
}

export { DiscardPosTableService };
