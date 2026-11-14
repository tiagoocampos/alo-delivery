import { AppError } from "../AppError.js";

export class AIAssistUnavailableError extends AppError {
    constructor(message = "A IA está indisponível agora. Tente de novo em instantes.") {
        super(message, 503);
        this.name = "AIAssistUnavailableError";
        Object.setPrototypeOf(this, AIAssistUnavailableError.prototype);
    }
}

export class AIInvalidResponseError extends AppError {
    constructor() {
        super("A IA retornou uma resposta em formato inesperado. Tente de novo.", 502);
        this.name = "AIInvalidResponseError";
        Object.setPrototypeOf(this, AIInvalidResponseError.prototype);
    }
}
