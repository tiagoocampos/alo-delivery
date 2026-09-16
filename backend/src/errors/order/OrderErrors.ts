import { AppError } from "../AppError.js";

function formatCentsToBRL(cents: number): string {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export class OrderBelowMinimumError extends AppError {
    constructor(minimumOrderValue: number) {
        super(`O pedido mínimo desta loja é de ${formatCentsToBRL(minimumOrderValue)}`, 422);
        this.name = "OrderBelowMinimumError";
        Object.setPrototypeOf(this, OrderBelowMinimumError.prototype);
    }
}

export class OrderNotFoundError extends AppError {
    constructor() {
        super("Pedido não encontrado", 404);
        this.name = "OrderNotFoundError";
        Object.setPrototypeOf(this, OrderNotFoundError.prototype);
    }
}

export class ProductUnavailableError extends AppError {
    constructor(productId: string) {
        super(`O produto ${productId} não está disponível nesta loja`, 400);
        this.name = "ProductUnavailableError";
        Object.setPrototypeOf(this, ProductUnavailableError.prototype);
    }
}

export class InvalidFlavorSelectionError extends AppError {
    constructor(message: string) {
        super(message, 400);
        this.name = "InvalidFlavorSelectionError";
        Object.setPrototypeOf(this, InvalidFlavorSelectionError.prototype);
    }
}

export class InvalidCategoryCrustError extends AppError {
    constructor() {
        super("Borda inválida para esta categoria", 400);
        this.name = "InvalidCategoryCrustError";
        Object.setPrototypeOf(this, InvalidCategoryCrustError.prototype);
    }
}

export class InvalidProductExtraError extends AppError {
    constructor() {
        super("Adicional inválido para este produto", 400);
        this.name = "InvalidProductExtraError";
        Object.setPrototypeOf(this, InvalidProductExtraError.prototype);
    }
}

export class InvalidCategorySizeError extends AppError {
    constructor() {
        super("Tamanho inválido para este pedido", 400);
        this.name = "InvalidCategorySizeError";
        Object.setPrototypeOf(this, InvalidCategorySizeError.prototype);
    }
}

export class InvalidOrderStatusTransitionError extends AppError {
    constructor(from: string, to: string) {
        super(`Não é possível mudar o status do pedido de "${from}" para "${to}"`, 400);
        this.name = "InvalidOrderStatusTransitionError";
        Object.setPrototypeOf(this, InvalidOrderStatusTransitionError.prototype);
    }
}

const STATUS_LABELS: Record<string, string> = {
    preparo: "em preparo",
    transporte: "a caminho",
    entregue: "entregue",
    cancelado: "cancelado"
};

export class OrderCannotBeCanceledError extends AppError {
    constructor(status: string) {
        super(`Esse pedido já está ${STATUS_LABELS[status] ?? status} — entre em contato com a loja para cancelar`, 422);
        this.name = "OrderCannotBeCanceledError";
        Object.setPrototypeOf(this, OrderCannotBeCanceledError.prototype);
    }
}
