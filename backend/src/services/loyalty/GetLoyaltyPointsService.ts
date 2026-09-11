import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";

interface GetLoyaltyPointsServiceProps {
    slug: string;
    customerPhone: string;
}

class GetLoyaltyPointsService {
    async execute({ slug, customerPhone }: GetLoyaltyPointsServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: {
                slug
            },
            select: {
                id: true
            }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        const loyalty = await prismaClient.loyaltyPoint.findUnique({
            where: {
                tenantId_customerPhone: {
                    tenantId: tenant.id,
                    customerPhone
                }
            },
            select: {
                points: true,
                updatedAt: true
            }
        });

        // Cliente sem histórico não é erro: ele simplesmente ainda tem zero ponto.
        return {
            customerPhone,
            points: loyalty?.points ?? 0,
            updatedAt: loyalty?.updatedAt ?? null
        };
    }
}

export { GetLoyaltyPointsService };
