import { compare } from "bcrypt"
import { UserNotFoundError } from "../../errors/user/UserErrors.js"
import prismaClient from "../../prisma/index.js"
import jwt from "jsonwebtoken";

interface LoginServiceProps {
    email: string,
    password: string

}

class LoginTenantService {
    async execute({ email, password }: LoginServiceProps) {
        const user = await prismaClient.user.findUnique({
            where: { email: email },
        })

        // Senha errada devolve o mesmo erro de e-mail inexistente, de propósito,
        // pra não entregar quais e-mails estão cadastrados.
        if (!user) {
            throw new UserNotFoundError()
        }

        const passwordMatch = await compare(password, user.passwordHash)
        if (!passwordMatch) {
            throw new UserNotFoundError();
        }

        const token = jwt.sign({
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        }, process.env.JWT_SECRET as string, {
            subject: user.id,
            expiresIn: "1d"
        })

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            token: token
        }
    }
}

export { LoginTenantService }
