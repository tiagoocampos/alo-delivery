import { z } from "zod";

// Aceita telefone com qualquer formatação razoável — (54) 99906-7417,
// 54 99906 7417, +55 54999067417 etc. A validação olha só a contagem de
// dígitos; quem normaliza o valor de fato pra gravar/buscar no banco é o
// controller (validateSchema não reescreve req.body), usando normalizePhone.
export const phoneSchema = z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length >= 10 && value.length <= 11, {
        message: "Telefone inválido",
    });
