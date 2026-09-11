import { AppError } from "../AppError.js";

export class CustomerAlreadyExistsError extends AppError {
    constructor() {
        super("Cliente já cadastrado nesta loja", 400);
        this.name = "CustomerAlreadyExistsError";
        Object.setPrototypeOf(this, CustomerAlreadyExistsError.prototype);
    }
}

export class CustomerNotFoundError extends AppError {
    constructor() {
        super("Telefone ou senha inválidos", 404);
        this.name = "CustomerNotFoundError";
        Object.setPrototypeOf(this, CustomerNotFoundError.prototype);
    }
}

export class CustomerTenantMismatchError extends AppError {
    constructor() {
        super("Este cliente não pertence a esta loja", 403);
        this.name = "CustomerTenantMismatchError";
        Object.setPrototypeOf(this, CustomerTenantMismatchError.prototype);
    }
}

export class AddressNotFoundError extends AppError {
    constructor() {
        super("Endereço não encontrado", 404);
        this.name = "AddressNotFoundError";
        Object.setPrototypeOf(this, AddressNotFoundError.prototype);
    }
}
