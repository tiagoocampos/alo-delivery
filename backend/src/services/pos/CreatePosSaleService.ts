import { PosSaleTotalTooHighError } from "../../errors/pos/PosErrors.js";
import prismaClient from "../../prisma/index.js";
import { assertPosPlan, MAX_POS_TOTAL } from "./assertPosPlan.js";
import { buildPosItems, sumPosItems, toOrderItemCreate, type PosItemInput } from "./buildPosItems.js";
import { posSaleSelect } from "./posSaleSelect.js";

type PosPaymentMethod = "dinheiro" | "pix" | "cartao_debito" | "cartao_credito";

interface CreatePosSaleServiceProps {
    tenantId: string;
    clientId?: string | undefined;
    paymentMethod: PosPaymentMethod;
    items: PosItemInput[];
}

// Venda rápida (sem mesa): nasce já fechada e paga.
class CreatePosSaleService {
    async execute({ tenantId, clientId, paymentMethod, items }: CreatePosSaleServiceProps) {

        await assertPosPlan(tenantId);

        // Idempotência: reenvio da mesma venda (duplo clique, falha de rede)
        // devolve a que já existe em vez de duplicar.
        if (clientId) {
            const existing = await this.findByClientId(tenantId, clientId);

            if (existing) {
                return { sale: existing, created: false };
            }
        }

        const builtItems = await buildPosItems(tenantId, items);
        const subtotal = sumPosItems(builtItems);

        if (subtotal > MAX_POS_TOTAL) {
            throw new PosSaleTotalTooHighError();
        }

        // Sem minimumOrderValue, fidelidade, push ou máquina de estados:
        // a venda de balcão já nasce "entregue".
        try {
            const sale = await prismaClient.order.create({
                data: {
                    tenantId,
                    origin: "balcao",
                    status: "entregue",
                    customerName: "Balcão",
                    customerPhone: null,
                    address: null,
                    tableLabel: null,
                    closedAt: new Date(),
                    paymentMethod,
                    clientId: clientId ?? null,
                    subtotal,
                    deliveryFee: 0,
                    total: subtotal,
                    items: {
                        create: builtItems.map(toOrderItemCreate)
                    }
                },
                select: posSaleSelect
            });

            return { sale, created: true };
        } catch (error) {
            // Duas requisições com o mesmo clientId em paralelo: a segunda
            // bate no unique (tenantId, clientId) e devolve a venda da primeira.
            if (clientId && (error as { code?: string }).code === "P2002") {
                const existing = await this.findByClientId(tenantId, clientId);

                if (existing) {
                    return { sale: existing, created: false };
                }
            }

            throw error;
        }
    }

    private findByClientId(tenantId: string, clientId: string) {
        return prismaClient.order.findFirst({
            where: {
                tenantId,
                clientId,
                origin: "balcao"
            },
            select: posSaleSelect
        });
    }
}

export { CreatePosSaleService };
