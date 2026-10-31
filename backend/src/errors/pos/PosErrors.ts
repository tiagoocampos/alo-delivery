import { AppError } from "../AppError.js";

export class PosSaleAlreadyCanceledError extends AppError {
    constructor() {
        super("Esta venda já foi cancelada", 422);
        this.name = "PosSaleAlreadyCanceledError";
        Object.setPrototypeOf(this, PosSaleAlreadyCanceledError.prototype);
    }
}

export class PosPlanRequiredError extends AppError {
    constructor() {
        super("O PDV de balcão está disponível apenas no plano completo", 403);
        this.name = "PosPlanRequiredError";
        Object.setPrototypeOf(this, PosPlanRequiredError.prototype);
    }
}

export class PosSaleTotalTooHighError extends AppError {
    constructor() {
        super("O valor total da venda excede o limite permitido", 400);
        this.name = "PosSaleTotalTooHighError";
        Object.setPrototypeOf(this, PosSaleTotalTooHighError.prototype);
    }
}
