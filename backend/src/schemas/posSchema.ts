import { z } from "zod";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Data inválida, use o formato AAAA-MM-DD" });

const quantity = z
    .number()
    .int({ message: "A quantidade deve ser um número inteiro" })
    .min(1, { message: "A quantidade mínima é 1" })
    .max(99, { message: "A quantidade máxima é 99" });

const productSaleItemSchema = z.object({
    type: z.literal("product"),
    productId: z.string().uuid({ message: "Produto inválido" }),
    variantId: z.string().uuid({ message: "Variação inválida" }).optional(),
    extraIds: z.array(z.string().uuid({ message: "Adicional inválido" })).optional(),
    quantity,
});

// Item avulso (cigarro, pizza, qualquer coisa fora do cadastro): único caso em
// que o preço vem do cliente, em centavos.
const customSaleItemSchema = z.object({
    type: z.literal("custom"),
    name: z
        .string()
        .trim()
        .min(1, { message: "O nome do item é obrigatório" })
        .max(80, { message: "O nome do item deve ter no máximo 80 caracteres" }),
    unitPrice: z
        .number()
        .int({ message: "O preço deve ser um inteiro em centavos" })
        .min(1, { message: "O preço deve ser maior que zero" })
        .max(10000000, { message: "O preço excede o limite permitido" }),
    quantity,
});

export const createPosSaleSchema =
    z.object({
        body: z.object({
            clientId: z.string().uuid({ message: "Identificador da venda inválido" }).optional(),
            paymentMethod: z.enum(["dinheiro", "pix", "cartao_debito", "cartao_credito"], {
                message: "Forma de pagamento inválida"
            }),
            items: z
                .array(z.discriminatedUnion("type", [productSaleItemSchema, customSaleItemSchema]))
                .min(1, { message: "A venda precisa de pelo menos um item" })
                .max(100, { message: "A venda pode ter no máximo 100 itens" }),
        })
    })

export const listPosSalesSchema =
    z.object({
        query: z.object({
            date: dateOnly.optional(),
        })
    })

export const cancelPosSaleSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Venda inválida" }),
        }),
        body: z.object({
            reason: z
                .string()
                .trim()
                .min(1, { message: "O motivo do cancelamento é obrigatório" })
                .max(200, { message: "O motivo deve ter no máximo 200 caracteres" }),
        })
    })
