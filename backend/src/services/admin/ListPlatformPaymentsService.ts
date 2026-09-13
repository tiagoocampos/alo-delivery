import prismaClient from "../../prisma/index.js";
import { getMonthRangeFromString } from "../../utils/dateRange.js";

interface ListPlatformPaymentsServiceProps {
    tenantId?: string | undefined;
    month?: string | undefined;
}

class ListPlatformPaymentsService {
    async execute({ tenantId, month }: ListPlatformPaymentsServiceProps) {

        const monthRange = month ? getMonthRangeFromString(month) : undefined;

        const payments = await prismaClient.platformPayment.findMany({
            where: {
                ...(tenantId ? { tenantId } : {}),
                ...(monthRange ? { paidAt: { gte: monthRange.start, lte: monthRange.end } } : {})
            },
            orderBy: {
                paidAt: "desc"
            },
            select: {
                id: true,
                tenantId: true,
                amount: true,
                paidAt: true,
                note: true,
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                }
            }
        });

        return payments;
    }
}

export { ListPlatformPaymentsService };
