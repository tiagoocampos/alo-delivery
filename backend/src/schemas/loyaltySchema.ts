import { z } from "zod";

export const getLoyaltyPointsSchema =
    z.object({
        params: z.object({
            slug: z.string().min(1, { message: "A loja é obrigatória" }),
        }),
        query: z.object({
            customerPhone: z.string().min(8, { message: "Telefone inválido" }),
        })
    })
