import { z } from "zod";

export const forgotPasswordSchema =
    z.object({
        body: z.object({
            email: z.string().email({ message: "Invalid email address" }),
        })
    })

export const resetPasswordSchema =
    z.object({
        body: z.object({
            token: z.string().min(1, { message: "Token é obrigatório" }),
            newPassword: z.string().min(6, { message: "Password must be at least 6 characters long" }),
        })
    })
