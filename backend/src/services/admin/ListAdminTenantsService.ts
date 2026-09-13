import prismaClient from "../../prisma/index.js";

class ListAdminTenantsService {
    async execute() {

        const tenants = await prismaClient.tenant.findMany({
            orderBy: {
                createdAt: "desc"
            },
            select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
                createdAt: true,
                subscription: {
                    select: {
                        planName: true,
                        monthlyPrice: true,
                        status: true
                    }
                }
            }
        });

        return tenants;
    }
}

export { ListAdminTenantsService };
