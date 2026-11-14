import { z } from "zod";

const MAX_ITEMS = 100;
const MAX_NAME = 120;
const MAX_DESCRIPTION = 500;
// Teto de preço em centavos (R$ 999.999,99): bem abaixo do limite do Int do Postgres.
export const MAX_PRICE_CENTS = 99_999_999;

const availability = z.enum(["ambos", "delivery", "balcao"], { message: "Disponibilidade inválida" });
const ingredients = z.array(z.string().max(200)).max(60, { message: "Ingredientes demais" });

// Preview: multipart/form-data, então o corpo só traz `text` (o arquivo vem em req.file).
// "Exatamente um dos dois" (arquivo ou texto) é conferido no service.
export const previewProductImportSchema = z.object({
    body: z.object({
        text: z
            .string()
            .max(8000, { message: "O texto do cardápio deve ter no máximo 8000 caracteres" })
            .optional(),
    }),
});

const createItem = z
    .object({
        action: z.literal("create"),
        name: z.string().trim().min(1, { message: "O nome do produto é obrigatório" }).max(MAX_NAME),
        description: z.string().trim().max(MAX_DESCRIPTION).optional(),
        priceCents: z.number().int().min(1, { message: "O preço deve ser maior que zero" }).max(MAX_PRICE_CENTS),
        categoryId: z.string().uuid({ message: "Categoria inválida" }).nullish(),
        newCategoryName: z.string().trim().min(1).max(60).nullish(),
        ingredients: ingredients.optional(),
        availability: availability.optional(),
    })
    .refine((item) => Boolean(item.categoryId) !== Boolean(item.newCategoryName), {
        message: "Informe a categoria existente (categoryId) ou o nome de uma nova (newCategoryName), apenas um dos dois",
        path: ["categoryId"],
    });

// Só estes quatro campos podem ser atualizados por aqui — nada de imagem,
// isActive, badge, categoria ou nome.
const updateFields = z
    .object({
        priceCents: z.number().int().min(1, { message: "O preço deve ser maior que zero" }).max(MAX_PRICE_CENTS).optional(),
        description: z.string().trim().max(MAX_DESCRIPTION).optional(),
        ingredients: ingredients.optional(),
        availability: availability.optional(),
    })
    .strict()
    .refine((fields) => Object.keys(fields).length > 0, { message: "Informe ao menos um campo para atualizar" });

const updateItem = z.object({
    action: z.literal("update"),
    productId: z.string().uuid({ message: "Produto inválido" }),
    fields: updateFields,
});

export const confirmProductImportSchema = z.object({
    body: z.object({
        items: z
            .array(z.discriminatedUnion("action", [createItem, updateItem]))
            .min(1, { message: "Envie ao menos um item" })
            .max(MAX_ITEMS, { message: `Envie no máximo ${MAX_ITEMS} itens` }),
    }),
});

export type ConfirmImportItem = z.infer<typeof confirmProductImportSchema>["body"]["items"][number];
