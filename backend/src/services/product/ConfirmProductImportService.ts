import { CategoryNotFoundError } from "../../errors/category/CategoryErrors.js";
import { ProductNotFoundError } from "../../errors/product/ProductErrors.js";
import { ProductImportCategoryHasSizesError, ProductImportInvalidItemError } from "../../errors/product/ProductImportErrors.js";
import prismaClient from "../../prisma/index.js";
import { parseIngredients } from "../../utils/ingredients.js";
import { normalizeName } from "../../utils/textMatch.js";
import type { ConfirmImportItem } from "../../schemas/productImportSchema.js";
import { assertImportPlan } from "./assertImportPlan.js";

interface ConfirmProductImportServiceProps {
    tenantId: string;
    items: ConfirmImportItem[];
}

function normalizeIngredients(list: string[]): string[] {
    const result = parseIngredients(JSON.stringify(list));
    if (!result.ok) throw new ProductImportInvalidItemError(result.message);
    return result.value;
}

class ConfirmProductImportService {
    // Grava criações e atualizações do rascunho revisado pelo lojista. Não chama IA.
    // Tudo em uma transação: qualquer item inválido desfaz o lote inteiro.
    async execute({ tenantId, items }: ConfirmProductImportServiceProps) {
        await assertImportPlan(tenantId);

        return prismaClient.$transaction(async (tx) => {
            const categories = await tx.category.findMany({
                where: { tenantId },
                select: { id: true, name: true, _count: { select: { sizes: true } } }
            });

            const byId = new Map(categories.map((category) => [category.id, { id: category.id, name: category.name, hasSizes: category._count.sizes > 0 }]));
            const byName = new Map([...byId.values()].map((category) => [normalizeName(category.name), category]));

            // Nomes já cadastrados por categoria: evita recriar (e pega duplicatas dentro do próprio lote).
            const existingProducts = await tx.product.findMany({
                where: { tenantId },
                select: { categoryId: true, name: true }
            });
            const taken = new Set(existingProducts.map((product) => `${product.categoryId}|${normalizeName(product.name)}`));

            const result = { created: 0, updated: 0, skipped: 0, categoriesCreated: 0 };

            for (const item of items) {
                if (item.action === "create") {
                    let category: { id: string; name: string; hasSizes: boolean } | undefined;

                    if (item.categoryId) {
                        // A categoria precisa ser desta loja (tenantId do JWT).
                        category = byId.get(item.categoryId);
                        if (!category) throw new CategoryNotFoundError();
                    } else {
                        const newName = item.newCategoryName!.replace(/\s+/g, " ").trim();
                        const key = normalizeName(newName);
                        if (!key) throw new ProductImportInvalidItemError("Nome de categoria inválido");

                        category = byName.get(key);
                        if (!category) {
                            const sortOrder = categories.length + result.categoriesCreated;
                            const created = await tx.category.create({
                                data: { tenantId, name: newName, sortOrder },
                                select: { id: true, name: true }
                            });
                            category = { id: created.id, name: created.name, hasSizes: false };
                            byId.set(category.id, category);
                            byName.set(key, category);
                            result.categoriesCreated += 1;
                        }
                    }

                    if (category.hasSizes) throw new ProductImportCategoryHasSizesError(category.name);

                    const takenKey = `${category.id}|${normalizeName(item.name)}`;
                    if (taken.has(takenKey)) {
                        result.skipped += 1;
                        continue;
                    }

                    await tx.product.create({
                        data: {
                            tenantId,
                            categoryId: category.id,
                            name: item.name,
                            description: item.description || null,
                            basePrice: item.priceCents,
                            availability: item.availability ?? "ambos",
                            ingredients: normalizeIngredients(item.ingredients ?? [])
                        },
                        select: { id: true }
                    });
                    taken.add(takenKey);
                    result.created += 1;
                    continue;
                }

                // update: sempre com tenantId no where (produto de outra loja = 404 e o lote todo falha).
                const product = await tx.product.findFirst({
                    where: { id: item.productId, tenantId },
                    select: { id: true, category: { select: { name: true, _count: { select: { sizes: true } } } } }
                });
                if (!product) throw new ProductNotFoundError();
                if (product.category._count.sizes > 0) throw new ProductImportCategoryHasSizesError(product.category.name);

                const { priceCents, description, ingredients, availability } = item.fields;

                await tx.product.update({
                    where: { id: product.id },
                    data: {
                        ...(priceCents !== undefined ? { basePrice: priceCents } : {}),
                        ...(description !== undefined ? { description: description || null } : {}),
                        ...(ingredients !== undefined ? { ingredients: normalizeIngredients(ingredients) } : {}),
                        ...(availability !== undefined ? { availability } : {})
                    },
                    select: { id: true }
                });
                result.updated += 1;
            }

            return result;
        });
    }
}

export { ConfirmProductImportService };
