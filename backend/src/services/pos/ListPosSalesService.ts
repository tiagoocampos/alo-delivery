import prismaClient from "../../prisma/index.js";
import { formatDateOnly, getDayRange } from "../../utils/dateRange.js";
import { posSaleSelect } from "./posSaleSelect.js";

interface ListPosSalesServiceProps {
    tenantId: string;
    date?: string | undefined;
}

const PAYMENT_METHODS = ["dinheiro", "pix", "cartao_debito", "cartao_credito"] as const;

class ListPosSalesService {
    async execute({ tenantId, date }: ListPosSalesServiceProps) {

        const { start, end } = getDayRange(date);

        const sales = await prismaClient.order.findMany({
            where: {
                tenantId,
                origin: "balcao",
                createdAt: { gte: start, lte: end }
            },
            orderBy: {
                createdAt: "desc"
            },
            select: posSaleSelect
        });

        // Canceladas aparecem na lista (marcadas), mas ficam fora do resumo.
        const validSales = sales.filter(sale => sale.status !== "cancelado");

        const byPaymentMethod = PAYMENT_METHODS.map(paymentMethod => {
            const ofMethod = validSales.filter(sale => sale.paymentMethod === paymentMethod);

            return {
                paymentMethod,
                count: ofMethod.length,
                total: ofMethod.reduce((sum, sale) => sum + sale.total, 0)
            };
        });

        return {
            date: date ?? formatDateOnly(new Date()),
            sales,
            summary: {
                totalSales: validSales.length,
                totalRevenue: validSales.reduce((sum, sale) => sum + sale.total, 0),
                byPaymentMethod
            }
        };
    }
}

export { ListPosSalesService };
