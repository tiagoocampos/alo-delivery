import prismaClient from "../../prisma/index.js";
import { assertPosPlan } from "./assertPosPlan.js";

interface ListPosTablesServiceProps {
    tenantId: string;
}

// Mesas abertas, as mais antigas primeiro. itemsCount = unidades na mesa
// (soma das quantidades), não o número de linhas.
class ListPosTablesService {
    async execute({ tenantId }: ListPosTablesServiceProps) {

        await assertPosPlan(tenantId);

        const tables = await prismaClient.order.findMany({
            where: {
                tenantId,
                origin: "balcao",
                status: "aberta"
            },
            orderBy: {
                createdAt: "asc"
            },
            select: {
                id: true,
                tableLabel: true,
                createdAt: true,
                total: true,
                items: {
                    select: {
                        quantity: true
                    }
                }
            }
        });

        return tables.map(table => ({
            id: table.id,
            label: table.tableLabel,
            openedAt: table.createdAt,
            itemsCount: table.items.reduce((sum, item) => sum + item.quantity, 0),
            total: table.total
        }));
    }
}

export { ListPosTablesService };
