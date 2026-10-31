import { OrderNotFoundError } from "../../errors/order/OrderErrors.js";
import { PosSaleAlreadyCanceledError } from "../../errors/pos/PosErrors.js";
import prismaClient from "../../prisma/index.js";
import { posSaleSelect } from "./posSaleSelect.js";

interface CancelPosSaleServiceProps {
    tenantId: string;
    saleId: string;
    reason: string;
}

// Cancelamento próprio da venda de balcão — não passa pelo
// UpdateOrderStatusService (sem máquina de estados, fidelidade ou push).
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

        if (sale.status !== "entregue") {
            throw new PosSaleAlreadyCanceledError();
        }

        // updateMany com o status no where: dois cancelamentos simultâneos
        // não sobrescrevem o motivo um do outro.
        const { count } = await prismaClient.order.updateMany({
            where: {
                id: sale.id,
                status: "entregue"
            },
            data: {
                status: "cancelado",
                canceledBy: "store",
                cancelReason: reason
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
