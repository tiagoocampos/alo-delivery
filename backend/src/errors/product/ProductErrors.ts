import { AppError } from "../AppError.js";

export class ProductNotFoundError extends AppError {
    constructor() {
        super("Produto não encontrado", 404);
        this.name = "ProductNotFoundError";
        Object.setPrototypeOf(this, ProductNotFoundError.prototype);
    }
}

export class ProductVariantNotFoundError extends AppError {
    constructor() {
        super("Variação não encontrada para este produto", 404);
        this.name = "ProductVariantNotFoundError";
        Object.setPrototypeOf(this, ProductVariantNotFoundError.prototype);
    }
}

export class ProductImageRequiredError extends AppError {
    constructor() {
        super("A imagem do produto é obrigatória", 400);
        this.name = "ProductImageRequiredError";
        Object.setPrototypeOf(this, ProductImageRequiredError.prototype);
    }
}

export class InvalidImageTypeError extends AppError {
    constructor() {
        super("Tipo de arquivo inválido, envie JPEG, JPG ou PNG", 400);
        this.name = "InvalidImageTypeError";
        Object.setPrototypeOf(this, InvalidImageTypeError.prototype);
    }
}

export class ImageUploadError extends AppError {
    constructor() {
        super("Erro ao fazer upload da imagem", 502);
        this.name = "ImageUploadError";
        Object.setPrototypeOf(this, ImageUploadError.prototype);
    }
}
