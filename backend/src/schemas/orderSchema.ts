import { z } from "zod";

const orderStatus = z.enum(["novo", "preparo", "transporte", "entregue", "cancelado"]);

const normalOrderItemSchema = z.object({
    productId: z.string().uuid({ message: "Produto inválido" }),
    variantId: z.string().uuid({ message: "Variação inválida" }).optional(),
    quantity: z.number().int().positive({ message: "A quantidade deve ser maior que zero" }),
    note: z.string().optional(),
});

const sizeOrderItemSchema = z.object({
    categorySizeId: z.string().uuid({ message: "Tamanho inválido" }),
    flavorProductIds: z
        .array(z.string().uuid({ message: "Sabor inválido" }))
        .min(1, { message: "Escolha pelo menos um sabor" }),
    categoryCrustId: z.string().uuid({ message: "Borda inválida" }).optional(),
    quantity: z.number().int().positive({ message: "A quantidade deve ser maior que zero" }),
    note: z.string().optional(),
});

export const createOrderSchema =
    z.object({
        params: z.object({
            slug: z.string().min(1, { message: "A loja é obrigatória" }),
        }),
        body: z.object({
            customerName: z.string().min(1, { message: "O nome do cliente é obrigatório" }),
            customerPhone: z.string().min(8, { message: "Telefone inválido" }),
            address: z.string().min(1, { message: "O endereço de entrega é obrigatório" }),
            paymentMethod: z.enum(["pix_manual", "na_entrega"], {
                message: "Forma de pagamento inválida"
            }),
            items: z
                .array(z.union([normalOrderItemSchema, sizeOrderItemSchema]))
                .min(1, { message: "O pedido precisa de pelo menos um item" }),
        })
    })

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Data inválida, use o formato AAAA-MM-DD" });

export const listOrdersSchema =
    z.object({
        query: z.object({
            status: orderStatus.optional(),
            date: dateOnly.optional(),
        })
    })

export const getOrdersSummarySchema =
    z.object({
        query: z.object({
            date: dateOnly.optional(),
        })
    })

export const getOrderDetailSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Pedido inválido" }),
        })
    })

export const updateOrderStatusSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Pedido inválido" }),
        }),
        body: z.object({
            status: orderStatus,
        })
    })
