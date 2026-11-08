// Preenche Product.ingredients a partir da descrição dos produtos de UM tenant.
// Só mexe em produto com a lista vazia e com descrição que pareça uma lista de
// ingredientes ("Pão, hambúrguer, ketchup e mostarda"). Nunca altera produto
// que já tem ingredientes.
//
// Por padrão é DRY-RUN: só imprime o que faria. Para gravar, passe --apply.
//
// Uso:
//   npx tsx scripts/backfillIngredients.ts --tenantId=<id>            (simulação)
//   npx tsx scripts/backfillIngredients.ts --tenantId=<id> --apply    (grava)

import prismaClient from "../src/prisma/index.js";
import { extractIngredientsFromDescription } from "../src/utils/ingredients.js";

function readArg(name: string): string | undefined {
    const prefix = `--${name}=`;
    return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

async function main() {
    const tenantId = readArg("tenantId");
    const apply = process.argv.includes("--apply");

    if (!tenantId) {
        console.error("Uso: npx tsx scripts/backfillIngredients.ts --tenantId=<id> [--apply]");
        process.exit(1);
    }

    const tenant = await prismaClient.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true, name: true }
    });

    if (!tenant) {
        console.error(`Tenant ${tenantId} não encontrado.`);
        process.exit(1);
    }

    console.log(`${apply ? "APLICANDO em" : "DRY-RUN (nada será gravado) para"}: ${tenant.name} (${tenant.id})\n`);

    const products = await prismaClient.product.findMany({
        where: {
            tenantId: tenant.id,
            ingredients: { isEmpty: true },
            description: { not: null }
        },
        orderBy: { name: "asc" },
        select: { id: true, name: true, description: true }
    });

    let filled = 0;
    let skipped = 0;

    for (const product of products) {
        const extraction = extractIngredientsFromDescription(product.description ?? "");

        if (!extraction.ok) {
            skipped++;
            console.log(`- ${product.name}: ignorado (${extraction.reason})`);
            continue;
        }

        console.log(`- ${product.name}: ${JSON.stringify(extraction.ingredients)}`);
        filled++;

        if (apply) {
            // O filtro isEmpty garante que ninguém grava por cima de ingredientes
            // cadastrados no meio do caminho.
            await prismaClient.product.updateMany({
                where: { id: product.id, tenantId: tenant.id, ingredients: { isEmpty: true } },
                data: { ingredients: extraction.ingredients }
            });
        }
    }

    console.log(
        `\n${products.length} produto(s) sem ingredientes e com descrição · ` +
        `${filled} ${apply ? "preenchido(s)" : "seriam preenchidos"} · ${skipped} ignorado(s).`
    );
    if (!apply && filled > 0) console.log("Para gravar, rode de novo com --apply.");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(() => prismaClient.$disconnect());
