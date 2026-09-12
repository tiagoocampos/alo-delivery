import { z } from "zod";

export const createCategorySchema =
    z.object({
        body: z.object({
            name: z.string().min(1, { message: "O nome da categoria é obrigatório" }),
            sortOrder: z.number().int().min(0, { message: "A ordem deve ser um inteiro não negativo" }).optional(),
        })
    })

export const deleteCategorySchema =
    z.object({
        params: z.object({
            categoryId: z.string().uuid({ message: "Categoria inválida" }),
        })
    })

export const updateCategorySchema =
    z.object({
        params: z.object({
            categoryId: z.string().uuid({ message: "Categoria inválida" }),
        }),
        body: z.object({
            name: z.string().min(1, { message: "O nome da categoria é obrigatório" }).optional(),
            sortOrder: z.number().int().min(0, { message: "A ordem deve ser um inteiro não negativo" }).optional(),
            isActive: z.boolean().optional(),
        })
    })
