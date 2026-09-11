import { AddressNotFoundError } from "../../errors/customer/CustomerErrors.js";
import prismaClient from "../../prisma/index.js";

interface DeleteAddressServiceProps {
    customerId: string;
    addressId: string;
}

class DeleteAddressService {
    async execute({ customerId, addressId }: DeleteAddressServiceProps) {

        const address = await prismaClient.address.findFirst({
            where: {
                id: addressId,
                customerId
            }
        });

        if (!address) {
            throw new AddressNotFoundError();
        }

        await prismaClient.address.delete({
            where: { id: address.id }
        });

        return { id: address.id };
    }
}

export { DeleteAddressService };
