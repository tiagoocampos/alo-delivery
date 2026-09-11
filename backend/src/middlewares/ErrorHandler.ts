import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { UserAlreadyExistsError } from '../errors/tenant/TenantErrors.js';
import { PasswordNotMatchError, UserNotFoundError } from '../errors/user/UserErrors.js';
import { InvalidToken } from '../errors/InvalidToken.js';




export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error instanceof ZodError) {
        return res.status(400).json({
            error: "Erro de validação",
            details: error.issues.map(issue => ({
                message: issue.message,
                path: issue.path[1],
            })),
        });
    }

    if (error instanceof UserAlreadyExistsError) {
        return res.status((error as any).statusCode).json({
            error: error.message,

        });
    }
    if (error instanceof UserNotFoundError) {
        return res.status((error as any).statusCode).json({
            error: error.message
        })
    }
    if (error instanceof PasswordNotMatchError) {
        return res.status((error as any).statusCode).json({
            error: error.message
        })
    }

    if (error instanceof InvalidToken) {
        return res.status((error as any).statusCode).json({
            error: error.message
        })
    }
    return res.status(500).json({ error: "Erro interno" });
};