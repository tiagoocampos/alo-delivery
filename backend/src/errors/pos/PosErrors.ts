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

export class PosTableAlreadyOpenError extends AppError {
    constructor(label: string, tableId: string) {
        super(`Já existe uma mesa aberta com o nome "${label}"`, 409, { tableId });
        this.name = "PosTableAlreadyOpenError";
        Object.setPrototypeOf(this, PosTableAlreadyOpenError.prototype);
    }
}

export class PosTableLimitReachedError extends AppError {
    constructor(limit: number) {
        super(`Limite de ${limit} mesas abertas atingido. Feche ou descarte alguma antes de abrir outra`, 422);
        this.name = "PosTableLimitReachedError";
        Object.setPrototypeOf(this, PosTableLimitReachedError.prototype);
    }
}

export class PosTableNotOpenError extends AppError {
    constructor() {
        super("Esta mesa não está aberta", 422);
        this.name = "PosTableNotOpenError";
        Object.setPrototypeOf(this, PosTableNotOpenError.prototype);
    }
}

export class PosTableEmptyError extends AppError {
    constructor() {
        super("A mesa não tem itens. Use \"Descartar mesa\" para removê-la", 422);
        this.name = "PosTableEmptyError";
        Object.setPrototypeOf(this, PosTableEmptyError.prototype);
    }
}

export class PosTableNotEmptyError extends AppError {
    constructor() {
        super("A mesa tem itens e não pode ser descartada. Peça ao dono para cancelá-la", 422);
        this.name = "PosTableNotEmptyError";
        Object.setPrototypeOf(this, PosTableNotEmptyError.prototype);
    }
}

export class PosTableItemLimitReachedError extends AppError {
    constructor(limit: number) {
        super(`Limite de ${limit} itens por mesa atingido`, 422);
        this.name = "PosTableItemLimitReachedError";
        Object.setPrototypeOf(this, PosTableItemLimitReachedError.prototype);
    }
}

export class PosItemNotFoundError extends AppError {
    constructor() {
        super("Item não encontrado nesta mesa", 404);
        this.name = "PosItemNotFoundError";
        Object.setPrototypeOf(this, PosItemNotFoundError.prototype);
    }
}

export class PosSaleTotalTooHighError extends AppError {
    constructor() {
        super("O valor total da venda excede o limite permitido", 400);
        this.name = "PosSaleTotalTooHighError";
        Object.setPrototypeOf(this, PosSaleTotalTooHighError.prototype);
    }
}
