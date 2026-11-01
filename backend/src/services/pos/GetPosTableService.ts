import prismaClient from "../../prisma/index.js";
import { assertPosPlan } from "./assertPosPlan.js";
import { loadPosTableDetail } from "./posTableHelpers.js";

interface GetPosTableServiceProps {
    tenantId: string;
    tableId: string;
}

class GetPosTableService {
    async execute({ tenantId, tableId }: GetPosTableServiceProps) {

        await assertPosPlan(tenantId);

        return loadPosTableDetail(prismaClient, tenantId, tableId);
    }
}

export { GetPosTableService };
