import { AppError } from "../AppError.js";

export class CategoryNotFoundError extends AppError {
    constructor() {
        super("Categoria não encontrada", 404);
        this.name = "CategoryNotFoundError";
        Object.setPrototypeOf(this, CategoryNotFoundError.prototype);
    }
}
