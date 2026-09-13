import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";

interface GetAdminTenantDetailServiceProps {
    tenantId: string;
}

class GetAdminTenantDetailService {
    async execute({ tenantId }: GetAdminTenantDetailServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: {
                id: tenantId
            },
            select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
                createdAt: true,
                subscription: {
                    select: {
                        id: true,
                        planName: true,
                        monthlyPrice: true,
                        status: true,
                        startedAt: true,
                        canceledAt: true
                    }
                },
                payments: {
                    orderBy: {
                        paidAt: "desc"
                    },
                    select: {
                        id: true,
                        amount: true,
                        paidAt: true,
                        note: true
                    }
                }
            }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        return tenant;
    }
}

export { GetAdminTenantDetailService };
