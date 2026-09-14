import { AppError } from "../AppError.js";

export class SubscriptionCanceledError extends AppError {
    constructor() {
        super("Esta loja está com a assinatura cancelada. Entre em contato com o suporte.", 402);
        this.name = "SubscriptionCanceledError";
        Object.setPrototypeOf(this, SubscriptionCanceledError.prototype);
    }
}
