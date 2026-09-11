import bcrypt from "bcrypt";
import { UserAlreadyExistsError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";

interface RegisterTenantInput {
    storeName: string;
    ownerName: string;
    email: string;
    password: string;
}

class RegisterTenantService {
    async execute({ storeName, ownerName, email, password }: RegisterTenantInput) {
        const existingUser = await prismaClient.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new UserAlreadyExistsError();
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const { tenant, user } = await prismaClient.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: storeName,
                    slug: storeName.toLowerCase().replace(/\s+/g, "-"),
                },
            });

            const user = await tx.user.create({
                data: {
                    tenantId: tenant.id,
                    name: ownerName,
                    email,
                    passwordHash,
                    role: "store_owner",
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    tenantId: true
                }
            });

            return { tenant, user };
        });

        return { tenant, user };
    }
}

export { RegisterTenantService };