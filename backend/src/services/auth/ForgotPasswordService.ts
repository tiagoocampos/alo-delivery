import crypto from "crypto";
import prismaClient from "../../prisma/index.js";
import transporter from "../../config/mailer.js";

interface ForgotPasswordServiceProps {
    email: string;
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

class ForgotPasswordService {
    // Sempre retorna sucesso genérico, exista ou não o e-mail — quem chama
    // (controller) não recebe nenhuma pista sobre isso, mesmo cuidado do login.
    async execute({ email }: ForgotPasswordServiceProps) {

        const user = await prismaClient.user.findUnique({
            where: { email },
            select: { id: true, email: true }
        });

        if (!user) {
            return;
        }

        // Apaga token antigo não usado antes de criar um novo, pra não acumular.
        await prismaClient.passwordResetToken.deleteMany({
            where: { userId: user.id }
        });

        const token = crypto.randomBytes(32).toString("hex");

        await prismaClient.passwordResetToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS)
            }
        });

        const resetLink = `${process.env.PAINEL_URL}/redefinir-senha?token=${token}`;

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: "Redefinir sua senha — Alô Delivery",
                text: `Clique no link para redefinir sua senha: ${resetLink}\n\nSe você não pediu isso, ignore este e-mail.`
            });
        } catch (error) {
            // Falha de envio nunca pode virar um 500 aqui: a resposta precisa
            // continuar genérica pro cliente, senão vira um oráculo de e-mail
            // cadastrado (sucesso quando não existe vs. erro quando existe).
            console.error("Falha ao enviar e-mail de redefinição de senha:", error);
        }
    }
}

export { ForgotPasswordService };
