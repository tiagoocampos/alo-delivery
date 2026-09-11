import { AppError } from "../AppError.js";

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

export class InvalidOrderStatusTransitionError extends AppError {
    constructor(from: string, to: string) {
        super(`Não é possível mudar o status do pedido de "${from}" para "${to}"`, 400);
        this.name = "InvalidOrderStatusTransitionError";
        Object.setPrototypeOf(this, InvalidOrderStatusTransitionError.prototype);
    }
}
