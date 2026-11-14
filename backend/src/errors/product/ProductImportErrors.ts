import { AppError } from "../AppError.js";

export class ProductImportPlanRequiredError extends AppError {
    constructor() {
        super("Importar cardápio com IA está disponível no plano completo.", 403);
        this.name = "ProductImportPlanRequiredError";
        Object.setPrototypeOf(this, ProductImportPlanRequiredError.prototype);
    }
}

export class ProductImportInputError extends AppError {
    constructor(message = "Envie uma imagem (campo file) ou um texto (campo text), apenas um dos dois.") {
        super(message, 400);
        this.name = "ProductImportInputError";
        Object.setPrototypeOf(this, ProductImportInputError.prototype);
    }
}

export class ProductImportNothingExtractedError extends AppError {
    constructor() {
        super("Não conseguimos ler o cardápio. Tente uma foto mais nítida ou cole o texto.", 422);
        this.name = "ProductImportNothingExtractedError";
        Object.setPrototypeOf(this, ProductImportNothingExtractedError.prototype);
    }
}

export class ProductImportCategoryHasSizesError extends AppError {
    constructor(categoryName: string) {
        super(`A categoria "${categoryName}" trabalha com tamanhos e não pode ser alterada por esta importação.`, 422);
        this.name = "ProductImportCategoryHasSizesError";
        Object.setPrototypeOf(this, ProductImportCategoryHasSizesError.prototype);
    }
}

export class ProductImportInvalidItemError extends AppError {
    constructor(message: string) {
        super(message, 400);
        this.name = "ProductImportInvalidItemError";
        Object.setPrototypeOf(this, ProductImportInvalidItemError.prototype);
    }
}
