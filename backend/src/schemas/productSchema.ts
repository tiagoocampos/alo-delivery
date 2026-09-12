import { z } from "zod";

// As rotas de criar/editar produto chegam como multipart/form-data (Multer),
// então todo campo do body vem como string e é convertido no controller.
const centsAsString = z
    .string()
    .regex(/^\d+$/, { message: "O preço deve ser um número inteiro em centavos" });

export const createProductSchema =
    z.object({
        body: z.object({
            name: z.string().min(1, { message: "O nome do produto é obrigatório" }),
            description: z.string().optional(),
            basePrice: centsAsString.optional(),
            categoryId: z.string().uuid({ message: "Categoria inválida" }),
            badge: z.enum(["mais_pedido", "promocao", "novo"]).nullable().optional(),
        })
    })

export const listProductsSchema =
    z.object({
        query: z.object({
            categoryId: z.string().uuid({ message: "Categoria inválida" }).optional(),
            isActive: z.enum(["true", "false"]).optional(),
        })
    })

export const updateProductSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Produto inválido" }),
        }),
        body: z.object({
            name: z.string().min(1, { message: "O nome do produto é obrigatório" }).optional(),
            description: z.string().optional(),
            basePrice: centsAsString.optional(),
            categoryId: z.string().uuid({ message: "Categoria inválida" }).optional(),
            isActive: z.enum(["true", "false"]).optional(),
            badge: z.enum(["mais_pedido", "promocao", "novo"]).nullable().optional(),
        })
    })

export const deleteProductSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Produto inválido" }),
        })
    })

export const createProductVariantSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Produto inválido" }),
        }),
        body: z.object({
            name: z.string().min(1, { message: "O nome da variação é obrigatório" }),
            priceDelta: z
                .number()
                .int({ message: "A diferença de preço deve ser um inteiro em centavos" })
                .optional(),
        })
    })
