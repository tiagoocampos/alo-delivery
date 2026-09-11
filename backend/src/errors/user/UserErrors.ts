
export class UserNotFoundError extends Error {
    public statusCode: number;
    constructor() {
        super("Usuário não encontrado");
        this.name = "UserNotFoundError";
        this.statusCode = 404;
        Object.setPrototypeOf(this, UserNotFoundError.prototype);
    }
}

export class PasswordNotMatchError extends Error {
    public statusCode: number;
    constructor() {
        super("Senha incorreta");
        this.name = "PasswordNotMatchError";
        this.statusCode = 401;
        Object.setPrototypeOf(this, PasswordNotMatchError.prototype);
    }
}