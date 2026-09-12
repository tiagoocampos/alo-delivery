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

export const createCategorySizeSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Categoria inválida" }),
        }),
        body: z.object({
            name: z.string().min(1, { message: "O nome do tamanho é obrigatório" }),
            price: z.number().int().min(0, { message: "O preço deve ser um inteiro não negativo em centavos" }),
            maxFlavors: z.number().int().positive({ message: "O número máximo de sabores deve ser maior que zero" }),
        })
    })

export const updateCategorySizeSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Categoria inválida" }),
            sizeId: z.string().uuid({ message: "Tamanho inválido" }),
        }),
        body: z.object({
            name: z.string().min(1, { message: "O nome do tamanho é obrigatório" }).optional(),
            price: z.number().int().min(0, { message: "O preço deve ser um inteiro não negativo em centavos" }).optional(),
            maxFlavors: z.number().int().positive({ message: "O número máximo de sabores deve ser maior que zero" }).optional(),
        })
    })

export const deleteCategorySizeSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Categoria inválida" }),
            sizeId: z.string().uuid({ message: "Tamanho inválido" }),
        })
    })

export const createCategoryCrustSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Categoria inválida" }),
        }),
        body: z.object({
            name: z.string().min(1, { message: "O nome da borda é obrigatório" }),
            priceDelta: z
                .number()
                .int({ message: "A diferença de preço deve ser um inteiro em centavos" })
                .optional(),
        })
    })

export const updateCategoryCrustSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Categoria inválida" }),
            crustId: z.string().uuid({ message: "Borda inválida" }),
        }),
        body: z.object({
            name: z.string().min(1, { message: "O nome da borda é obrigatório" }).optional(),
            priceDelta: z
                .number()
                .int({ message: "A diferença de preço deve ser um inteiro em centavos" })
                .optional(),
        })
    })

export const deleteCategoryCrustSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Categoria inválida" }),
            crustId: z.string().uuid({ message: "Borda inválida" }),
        })
    })
