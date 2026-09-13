import { AppError } from "../AppError.js";

export class PlatformExpenseNotFoundError extends AppError {
    constructor() {
        super("Despesa não encontrada", 404);
        this.name = "PlatformExpenseNotFoundError";
        Object.setPrototypeOf(this, PlatformExpenseNotFoundError.prototype);
    }
}
