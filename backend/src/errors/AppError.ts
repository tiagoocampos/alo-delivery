export class AppError extends Error {
    public statusCode: number;
    // Campos extras devolvidos junto do "error" na resposta (ex: id da mesa já aberta).
    public extra: Record<string, unknown> | undefined;

    constructor(message: string, statusCode: number, extra?: Record<string, unknown>) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.extra = extra;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
