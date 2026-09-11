import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { InvalidToken } from "../errors/InvalidToken.js";


interface PayLoad {
    sub: string
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {

    const authToken = req.headers.authorization;

    if (!authToken) {
        throw new InvalidToken();
    }

    const [, token] = authToken.split(" ");
    try {
        const { sub } = jwt.verify(token!, process.env.JWT_SECRET as string) as PayLoad;
        req.user_id = sub;

        return next();
    } catch (error) {
        throw new InvalidToken();
    }


}