import { assertPosPlan } from "./assertPosPlan.js";
import { CancelPosSaleService } from "./CancelPosSaleService.js";

interface CancelPosTableServiceProps {
    tenantId: string;
    tableId: string;
    reason: string;
}

// Rota de mesa: mesmo cancelamento da venda de balcão, só que no plano completo.
class CancelPosTableService {
    async execute({ tenantId, tableId, reason }: CancelPosTableServiceProps) {

        await assertPosPlan(tenantId);

        return new CancelPosSaleService().execute({ tenantId, saleId: tableId, reason });
    }
}

export { CancelPosTableService };
