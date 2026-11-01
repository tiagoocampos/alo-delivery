import { PosTableEmptyError, PosTableNotOpenError } from "../../errors/pos/PosErrors.js";
import prismaClient from "../../prisma/index.js";
import { assertPosPlan } from "./assertPosPlan.js";
import { loadPosTableDetail, lockPosOrder, recalculateTableTotals } from "./posTableHelpers.js";

type PosPaymentMethod = "dinheiro" | "pix" | "cartao_debito" | "cartao_credito";

interface ClosePosTableServiceProps {
    tenantId: string;
    tableId: string;
    paymentMethod: PosPaymentMethod;
}

// Fecha a conta: a mesa vira venda "entregue". Sem fidelidade, push ou
// máquina de estados.
class ClosePosTableService {
    async execute({ tenantId, tableId, paymentMethod }: ClosePosTableServiceProps) {

        await assertPosPlan(tenantId);

        return prismaClient.$transaction(async (tx) => {
            const status = await lockPosOrder(tx, tenantId, tableId);

            // Idempotente: reenvio/duplo clique em conta já fechada devolve a
            // venda como está, sem fechar de novo nem trocar a forma de pagamento.
            if (status === "entregue") {
                return loadPosTableDetail(tx, tenantId, tableId);
            }

            if (status !== "aberta") {
                throw new PosTableNotOpenError();
            }

            const itemsCount = await tx.orderItem.count({ where: { orderId: tableId } });

            if (itemsCount === 0) {
                throw new PosTableEmptyError();
            }

            // Total vem sempre dos itens, nunca do cliente.
            await recalculateTableTotals(tx, tableId);

            await tx.order.update({
                where: { id: tableId },
                data: {
                    status: "entregue",
                    paymentMethod,
                    closedAt: new Date()
                }
            });

            return loadPosTableDetail(tx, tenantId, tableId);
        });
    }
}

export { ClosePosTableService };
