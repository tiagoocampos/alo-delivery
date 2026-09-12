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

export class CategorySizeNotFoundError extends AppError {
    constructor() {
        super("Tamanho não encontrado para esta categoria", 404);
        this.name = "CategorySizeNotFoundError";
        Object.setPrototypeOf(this, CategorySizeNotFoundError.prototype);
    }
}

export class CategoryCrustNotFoundError extends AppError {
    constructor() {
        super("Borda não encontrada para esta categoria", 404);
        this.name = "CategoryCrustNotFoundError";
        Object.setPrototypeOf(this, CategoryCrustNotFoundError.prototype);
    }
}
