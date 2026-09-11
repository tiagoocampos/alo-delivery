import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { InvalidToken } from "../errors/InvalidToken.js";
import type { Role } from "../generated/prisma/enums.js";

interface TokenPayload {
    sub: string;
    role: Role;
    tenantId: string | null;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {

    const authToken = req.headers.authorization;

    if (!authToken) {
        throw new InvalidToken();
    }

    const [scheme, token] = authToken.split(" ");

    if (scheme !== "Bearer" || !token) {
        throw new InvalidToken();
    }

    try {
        const { sub, role, tenantId } = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as TokenPayload;

        req.auth = {
            userId: sub,
            tenantId: tenantId ?? null,
            role
        };

        return next();
    } catch (error) {
        throw new InvalidToken();
    }
}
