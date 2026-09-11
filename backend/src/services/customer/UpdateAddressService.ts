import { AddressNotFoundError } from "../../errors/customer/CustomerErrors.js";
import prismaClient from "../../prisma/index.js";

interface UpdateAddressServiceProps {
    customerId: string;
    addressId: string;
    label?: string | undefined;
    street?: string | undefined;
    number?: string | undefined;
    complement?: string | undefined;
    neighborhood?: string | undefined;
    city?: string | undefined;
    isDefault?: boolean | undefined;
}

class UpdateAddressService {
    async execute({
        customerId,
        addressId,
        label,
        street,
        number,
        complement,
        neighborhood,
        city,
        isDefault
    }: UpdateAddressServiceProps) {

        const address = await prismaClient.address.findFirst({
            where: {
                id: addressId,
                customerId
            }
        });

        if (!address) {
            throw new AddressNotFoundError();
        }

        const updated = await prismaClient.address.update({
            where: { id: address.id },
            data: {
                ...(label === undefined ? {} : { label }),
                ...(street === undefined ? {} : { street }),
                ...(number === undefined ? {} : { number }),
                ...(complement === undefined ? {} : { complement }),
                ...(neighborhood === undefined ? {} : { neighborhood }),
                ...(city === undefined ? {} : { city }),
                ...(isDefault === undefined ? {} : { isDefault }),
            }
        });

        return updated;
    }
}

export { UpdateAddressService };
