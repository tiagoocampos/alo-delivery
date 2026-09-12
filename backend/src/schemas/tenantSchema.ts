import { z } from "zod";

export const tenantSchema =
    z.object({
        body: z.object({
            storeName: z.string().min(1, { message: "Name is required" }),
            ownerName: z.string().min(1, { message: "Owner name is required" }),
            email: z.string().email({ message: "Invalid email address" }),
            password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
        })
    })

export const getTenantSchema =
    z.object({
        params: z.object({
            slug: z.string().min(1, { message: "A loja é obrigatória" }),
        })
    })

export const getStoreMenuSchema =
    z.object({
        params: z.object({
            slug: z.string().min(1, { message: "A loja é obrigatória" }),
        })
    })

export const updateMyTenantSchema =
    z.object({
        body: z.object({
            name: z.string().min(1, { message: "O nome da loja é obrigatório" }).optional(),
            slug: z.string()
                .min(1, { message: "O identificador da loja é obrigatório" })
                .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: "Use apenas letras minúsculas, números e hífens" })
                .optional(),
            phone: z.string().min(1, { message: "Telefone inválido" }).optional(),
            deliveryFee: z.number().int().min(0, { message: "A taxa de entrega deve ser um inteiro não negativo" }).optional(),
            isActive: z.boolean().optional(),
        })
    })
