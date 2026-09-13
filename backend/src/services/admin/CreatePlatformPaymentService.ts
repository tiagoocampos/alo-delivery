import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";

interface CreatePlatformPaymentServiceProps {
    tenantId: string;
    amount: number;
    paidAt: string;
    note?: string | undefined;
}

class CreatePlatformPaymentService {
    async execute({ tenantId, amount, paidAt, note }: CreatePlatformPaymentServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: { id: tenantId },
            select: { id: true }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        const payment = await prismaClient.platformPayment.create({
            data: {
                tenantId,
                amount,
                paidAt: new Date(paidAt),
                note: note ?? null
            },
            select: {
                id: true,
                tenantId: true,
                amount: true,
                paidAt: true,
                note: true
            }
        });

        return payment;
    }
}

export { CreatePlatformPaymentService };
