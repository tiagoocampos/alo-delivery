import { OrderNotFoundError } from "../../errors/order/OrderErrors.js";
import { PosSaleAlreadyCanceledError } from "../../errors/pos/PosErrors.js";
import prismaClient from "../../prisma/index.js";
import { posSaleSelect } from "./posSaleSelect.js";

interface CancelPosSaleServiceProps {
    tenantId: string;
    saleId: string;
    reason: string;
}

// Cancela venda fechada ("entregue") ou mesa aberta com itens ("aberta").
// Cancelamento próprio do balcão — não passa pelo UpdateOrderStatusService
// (sem máquina de estados, fidelidade ou push).
class CancelPosSaleService {
    async execute({ tenantId, saleId, reason }: CancelPosSaleServiceProps) {

        const sale = await prismaClient.order.findFirst({
            where: {
                id: saleId,
                tenantId,
                origin: "balcao"
            },
            select: {
                id: true,
                status: true
            }
        });

        if (!sale) {
            throw new OrderNotFoundError();
        }

        if (sale.status !== "entregue" && sale.status !== "aberta") {
            throw new PosSaleAlreadyCanceledError();
        }

        // updateMany com o status lido no where: dois cancelamentos simultâneos
        // (ou cancelar enquanto fecham a conta) não se atropelam. Mesa aberta
        // ganha closedAt agora; venda fechada mantém o closedAt original, que
        // define o dia dela nos relatórios.
        const { count } = await prismaClient.order.updateMany({
            where: {
                id: sale.id,
                status: sale.status
            },
            data: {
                status: "cancelado",
                canceledBy: "store",
                cancelReason: reason.trim(),
                ...(sale.status === "aberta" ? { closedAt: new Date() } : {})
            }
        });

        if (count === 0) {
            throw new PosSaleAlreadyCanceledError();
        }

        return prismaClient.order.findUniqueOrThrow({
            where: { id: sale.id },
            select: posSaleSelect
        });
    }
}

export { CancelPosSaleService };
