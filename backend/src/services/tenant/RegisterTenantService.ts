import bcrypt from "bcrypt";
import { UserAlreadyExistsError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";

interface RegisterTenantInput {
    storeName: string;
    ownerName: string;
    email: string;
    password: string;
}

// O slug é a chave pública da loja (/store/:slug/menu), então precisa sair
// sem acento, sem espaço e sem caractere especial.
function slugify(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
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
            // Duas lanchonetes podem ter o mesmo nome; o slug é unique, então
            // desempatamos com sufixo numérico em vez de estourar o constraint.
            const baseSlug = slugify(storeName) || "loja";
            let slug = baseSlug;
            let suffix = 1;

            while (await tx.tenant.findUnique({ where: { slug }, select: { id: true } })) {
                suffix += 1;
                slug = `${baseSlug}-${suffix}`;
            }

            const tenant = await tx.tenant.create({
                data: {
                    name: storeName,
                    slug,
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
