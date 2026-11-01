import { PosTableAlreadyOpenError, PosTableLimitReachedError } from "../../errors/pos/PosErrors.js";
import prismaClient from "../../prisma/index.js";
import { assertPosPlan } from "./assertPosPlan.js";
import { loadPosTableDetail, MAX_OPEN_TABLES } from "./posTableHelpers.js";

interface OpenPosTableServiceProps {
    tenantId: string;
    label: string;
}

class OpenPosTableService {
    async execute({ tenantId, label: rawLabel }: OpenPosTableServiceProps) {

        await assertPosPlan(tenantId);

        const label = rawLabel.trim();

        // Erro amigável antes do banco reclamar: já existe mesa aberta com esse
        // nome (sem diferenciar maiúscula/minúscula)? Devolve o id pra abrir ela.
        const existing = await this.findOpenByLabel(tenantId, label);

        if (existing) {
            throw new PosTableAlreadyOpenError(existing.tableLabel ?? label, existing.id);
        }

        const openTables = await prismaClient.order.count({
            where: { tenantId, origin: "balcao", status: "aberta" }
        });

        if (openTables >= MAX_OPEN_TABLES) {
            throw new PosTableLimitReachedError(MAX_OPEN_TABLES);
        }

        try {
            const table = await prismaClient.order.create({
                data: {
                    tenantId,
                    origin: "balcao",
                    status: "aberta",
                    tableLabel: label,
                    customerName: "Balcão",
                    customerPhone: null,
                    address: null,
                    paymentMethod: null,
                    subtotal: 0,
                    deliveryFee: 0,
                    total: 0
                },
                select: { id: true }
            });

            return loadPosTableDetail(prismaClient, tenantId, table.id);
        } catch (error) {
            // Duas aberturas simultâneas do mesmo nome: o índice único parcial
            // barra a segunda, e ela cai no mesmo erro amigável.
            if ((error as { code?: string }).code === "P2002") {
                const raced = await this.findOpenByLabel(tenantId, label);

                if (raced) {
                    throw new PosTableAlreadyOpenError(raced.tableLabel ?? label, raced.id);
                }
            }

            throw error;
        }
    }

    private findOpenByLabel(tenantId: string, label: string) {
        return prismaClient.order.findFirst({
            where: {
                tenantId,
                origin: "balcao",
                status: "aberta",
                tableLabel: { equals: label, mode: "insensitive" }
            },
            select: { id: true, tableLabel: true }
        });
    }
}

export { OpenPosTableService };
