import { z } from "zod";

const subscriptionStatus = z.enum(["trial", "active", "overdue", "canceled"]);
const monthOnly = z.string().regex(/^\d{4}-\d{2}$/, { message: "Mês inválido, use o formato AAAA-MM" });
const dateString = z.string().refine(value => !isNaN(Date.parse(value)), { message: "Data inválida" });
const positiveIntAsString = z
    .string()
    .regex(/^\d+$/, { message: "Deve ser um número inteiro positivo" });

export const getAdminTenantDetailSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Loja inválida" }),
        })
    })

export const upsertSubscriptionSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Loja inválida" }),
        }),
        body: z.object({
            planName: z.string().min(1, { message: "O nome do plano é obrigatório" }),
            monthlyPrice: z.number().int().min(0, { message: "O preço mensal deve ser um inteiro não negativo em centavos" }),
            status: subscriptionStatus,
        })
    })

export const listPlatformPaymentsSchema =
    z.object({
        query: z.object({
            tenantId: z.string().uuid({ message: "Loja inválida" }).optional(),
            month: monthOnly.optional(),
        })
    })

export const createPlatformPaymentSchema =
    z.object({
        body: z.object({
            tenantId: z.string().uuid({ message: "Loja inválida" }),
            amount: z.number().int().positive({ message: "O valor deve ser um inteiro positivo em centavos" }),
            paidAt: dateString,
            note: z.string().optional(),
        })
    })

export const listPlatformExpensesSchema =
    z.object({
        query: z.object({
            month: monthOnly.optional(),
        })
    })

export const createPlatformExpenseSchema =
    z.object({
        body: z.object({
            description: z.string().min(1, { message: "A descrição é obrigatória" }),
            category: z.string().optional(),
            amount: z.number().int().positive({ message: "O valor deve ser um inteiro positivo em centavos" }),
            date: dateString,
            isRecurring: z.boolean().optional(),
        })
    })

export const updatePlatformExpenseSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Despesa inválida" }),
        }),
        body: z.object({
            description: z.string().min(1, { message: "A descrição é obrigatória" }).optional(),
            category: z.string().optional(),
            amount: z.number().int().positive({ message: "O valor deve ser um inteiro positivo em centavos" }).optional(),
            date: dateString.optional(),
            isRecurring: z.boolean().optional(),
        })
    })

export const deletePlatformExpenseSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Despesa inválida" }),
        })
    })

export const getAdminRevenueSchema =
    z.object({
        query: z.object({
            months: positiveIntAsString.optional(),
        })
    })
