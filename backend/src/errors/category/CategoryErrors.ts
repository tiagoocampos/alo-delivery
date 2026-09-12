import { AppError } from "../AppError.js";

export class CategoryNotFoundError extends AppError {
    constructor() {
        super("Categoria não encontrada", 404);
        this.name = "CategoryNotFoundError";
        Object.setPrototypeOf(this, CategoryNotFoundError.prototype);
    }
}

export class CategoryHasProductsError extends AppError {
    constructor() {
        super("Não é possível excluir uma categoria que possui produtos vinculados", 400);
        this.name = "CategoryHasProductsError";
        Object.setPrototypeOf(this, CategoryHasProductsError.prototype);
    }
}
