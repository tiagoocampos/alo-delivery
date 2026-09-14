import bcrypt from "bcrypt";
import { InvalidResetTokenError } from "../../errors/auth/AuthErrors.js";
import prismaClient from "../../prisma/index.js";

interface ResetPasswordServiceProps {
    token: string;
    newPassword: string;
}

class ResetPasswordService {
    async execute({ token, newPassword }: ResetPasswordServiceProps) {

        const resetToken = await prismaClient.passwordResetToken.findUnique({
            where: { token }
        });

        if (!resetToken || resetToken.expiresAt < new Date()) {
            throw new InvalidResetTokenError();
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await prismaClient.$transaction([
            prismaClient.user.update({
                where: { id: resetToken.userId },
                data: { passwordHash }
            }),
            prismaClient.passwordResetToken.delete({
                where: { id: resetToken.id }
            })
        ]);
    }
}

export { ResetPasswordService };
