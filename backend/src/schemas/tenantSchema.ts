import { z } from "zod";
import { phoneSchema } from "./sharedSchema.js";

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

const businessHoursDaySchema = z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    isClosed: z.boolean(),
    opensAt: z.string().regex(/^\d{2}:\d{2}$/, { message: "Horário inválido, use HH:mm" }).nullable(),
    closesAt: z.string().regex(/^\d{2}:\d{2}$/, { message: "Horário inválido, use HH:mm" }).nullable(),
});

const businessHoursArraySchema = z
    .array(businessHoursDaySchema)
    .length(7, { message: "Informe os 7 dias da semana" });

export const updateMyTenantSchema =
    z.object({
        body: z.object({
            name: z.string().min(1, { message: "O nome da loja é obrigatório" }).optional(),
            slug: z.string()
                .min(1, { message: "O identificador da loja é obrigatório" })
                .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: "Use apenas letras minúsculas, números e hífens" })
                .optional(),
            phone: phoneSchema.optional(),
            deliveryFee: z.number().int().min(0, { message: "A taxa de entrega deve ser um inteiro não negativo" }).optional(),
            isActive: z.boolean().optional(),
            description: z.string().optional(),
            address: z.string().optional(),
            instagramUrl: z.string().url({ message: "URL do Instagram inválida" }).optional(),
            minimumOrderValue: z.preprocess(
                (value) => (typeof value === "string" ? Number(value) : value),
                z.number().int().min(0, { message: "O pedido mínimo deve ser um inteiro não negativo em centavos" })
            ).optional(),
            businessHours: z.preprocess((value) => {
                if (typeof value !== "string") return value;
                try {
                    return JSON.parse(value);
                } catch {
                    return value;
                }
            }, businessHoursArraySchema).optional(),
        })
    })
