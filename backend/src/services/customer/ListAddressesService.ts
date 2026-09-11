import prismaClient from "../../prisma/index.js";

interface ListAddressesServiceProps {
    customerId: string;
}

class ListAddressesService {
    async execute({ customerId }: ListAddressesServiceProps) {

        const addresses = await prismaClient.address.findMany({
            where: { customerId },
            orderBy: { isDefault: "desc" }
        });

        return addresses;
    }
}

export { ListAddressesService };
