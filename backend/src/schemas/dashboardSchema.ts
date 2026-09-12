import { z } from "zod";

const positiveIntAsString = z
    .string()
    .regex(/^\d+$/, { message: "Deve ser um número inteiro positivo" });

export const getDashboardRevenueSchema =
    z.object({
        query: z.object({
            days: positiveIntAsString.optional(),
        })
    })

export const getDashboardSummarySchema =
    z.object({
        query: z.object({})
    })

export const getDashboardTopProductsSchema =
    z.object({
        query: z.object({
            days: positiveIntAsString.optional(),
            limit: positiveIntAsString.optional(),
        })
    })
