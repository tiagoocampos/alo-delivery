import { z } from "zod";
import { phoneSchema } from "./sharedSchema.js";

export const getLoyaltyPointsSchema =
    z.object({
        params: z.object({
            slug: z.string().min(1, { message: "A loja é obrigatória" }),
        }),
        query: z.object({
            customerPhone: phoneSchema,
        })
    })
