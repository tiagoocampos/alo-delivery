import { z } from "zod";

const orderStatus = z.enum(["novo", "preparo", "transporte", "entregue", "cancelado"]);

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
                .array(z.object({
                    productId: z.string().uuid({ message: "Produto inválido" }),
                    variantId: z.string().uuid({ message: "Variação inválida" }).optional(),
                    quantity: z.number().int().positive({ message: "A quantidade deve ser maior que zero" }),
                    note: z.string().optional(),
                }))
                .min(1, { message: "O pedido precisa de pelo menos um item" }),
        })
    })

export const listOrdersSchema =
    z.object({
        query: z.object({
            status: orderStatus.optional(),
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
