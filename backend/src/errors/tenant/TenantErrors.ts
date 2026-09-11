export class UserAlreadyExistsError extends Error {
    public statusCode: number;
    constructor() {
        super("Usuário já cadastrado");
        this.name = "UserAlreadyExistsError";
        this.statusCode = 400;
        Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);
    }
}