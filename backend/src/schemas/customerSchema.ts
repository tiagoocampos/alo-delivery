import { z } from "zod";
import { phoneSchema } from "./sharedSchema.js";

const slugParam = z.object({
    slug: z.string().min(1, { message: "A loja é obrigatória" }),
});

export const registerCustomerSchema =
    z.object({
        params: slugParam,
        body: z.object({
            name: z.string().min(1, { message: "O nome é obrigatório" }),
            phone: phoneSchema,
            email: z.string().email({ message: "E-mail inválido" }).optional(),
            password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
        })
    })

export const loginCustomerSchema =
    z.object({
        params: slugParam,
        body: z.object({
            phone: phoneSchema,
            password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
        })
    })

export const getCustomerMeSchema =
    z.object({
        params: slugParam
    })

export const listAddressesSchema =
    z.object({
        params: slugParam
    })

export const createAddressSchema =
    z.object({
        params: slugParam,
        body: z.object({
            label: z.string().optional(),
            street: z.string().min(1, { message: "A rua é obrigatória" }),
            number: z.string().min(1, { message: "O número é obrigatório" }),
            complement: z.string().optional(),
            neighborhood: z.string().optional(),
            city: z.string().optional(),
            isDefault: z.boolean().optional(),
        })
    })

export const updateAddressSchema =
    z.object({
        params: slugParam.extend({
            id: z.string().uuid({ message: "Endereço inválido" }),
        }),
        body: z.object({
            label: z.string().optional(),
            street: z.string().min(1, { message: "A rua é obrigatória" }).optional(),
            number: z.string().min(1, { message: "O número é obrigatório" }).optional(),
            complement: z.string().optional(),
            neighborhood: z.string().optional(),
            city: z.string().optional(),
            isDefault: z.boolean().optional(),
        })
    })

export const deleteAddressSchema =
    z.object({
        params: slugParam.extend({
            id: z.string().uuid({ message: "Endereço inválido" }),
        })
    })

export const listCustomerOrdersSchema =
    z.object({
        params: slugParam
    })

export const cancelCustomerOrderSchema =
    z.object({
        params: slugParam.extend({
            orderId: z.string().uuid({ message: "Pedido inválido" }),
        }),
        body: z.object({
            reason: z.string().min(1, { message: "Informe o motivo do cancelamento" }),
        })
    })
