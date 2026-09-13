// Script único para criar (ou promover) um usuário platform_admin.
// Não existe rota de auto-registro para esse papel por segurança — só isso.
//
// Uso: npx tsx scripts/createPlatformAdmin.ts <email> <senha> <nome>

import bcrypt from "bcrypt";
import prismaClient from "../src/prisma/index.js";

async function main() {
    const [, , email, password, name] = process.argv;

    if (!email || !password || !name) {
        console.error("Uso: npx tsx scripts/createPlatformAdmin.ts <email> <senha> <nome>");
        process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prismaClient.user.upsert({
        where: { email },
        create: {
            tenantId: null,
            name,
            email,
            passwordHash,
            role: "platform_admin"
        },
        update: {
            name,
            passwordHash,
            role: "platform_admin",
            tenantId: null
        },
        select: { id: true, name: true, email: true, role: true }
    });

    console.log("platform_admin pronto:", user);
    process.exit(0);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
