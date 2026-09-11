import prismaClient from "../../prisma/index.js";

interface CreateAddressServiceProps {
    customerId: string;
    label?: string | undefined;
    street: string;
    number: string;
    complement?: string | undefined;
    neighborhood?: string | undefined;
    city?: string | undefined;
    isDefault?: boolean | undefined;
}

class CreateAddressService {
    async execute({
        customerId,
        label,
        street,
        number,
        complement,
        neighborhood,
        city,
        isDefault
    }: CreateAddressServiceProps) {

        const address = await prismaClient.address.create({
            data: {
                customerId,
                label: label ?? null,
                street,
                number,
                complement: complement ?? null,
                neighborhood: neighborhood ?? null,
                city: city ?? null,
                isDefault: isDefault ?? false
            }
        });

        return address;
    }
}

export { CreateAddressService };
