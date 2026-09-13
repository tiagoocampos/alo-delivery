import { InvalidOrderStatusTransitionError, OrderNotFoundError } from "../../errors/order/OrderErrors.js";
import prismaClient from "../../prisma/index.js";
import { SendOrderStatusPushService } from "./SendOrderStatusPushService.js";
import type { OrderStatus } from "../../generated/prisma/enums.js";

// Máquina de estados do pedido: só avança um passo por vez.
// Cancelar é permitido enquanto o pedido não chegou ao cliente.
// "entregue" e "cancelado" são estados finais.
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    novo: ["preparo", "cancelado"],
    preparo: ["transporte", "cancelado"],
    transporte: ["entregue", "cancelado"],
    entregue: [],
    cancelado: []
};

// Fidelização: 1 ponto a cada R$ 10,00 do total do pedido (valores em centavos).
const CENTS_PER_POINT = 1000;

interface UpdateOrderStatusServiceProps {
    tenantId: string;
    orderId: string;
    status: OrderStatus;
}

class UpdateOrderStatusService {
    async execute({ tenantId, orderId, status }: UpdateOrderStatusServiceProps) {

        const order = await prismaClient.order.findFirst({
            where: {
                id: orderId,
                tenantId
            },
            select: {
                id: true,
                status: true,
                total: true,
                customerPhone: true
            }
        });

        if (!order) {
            throw new OrderNotFoundError();
        }

        if (!ALLOWED_TRANSITIONS[order.status].includes(status)) {
            throw new InvalidOrderStatusTransitionError(order.status, status);
        }

        const orderSelect = {
            id: true,
            tenantId: true,
            customerName: true,
            customerPhone: true,
            status: true,
            subtotal: true,
            deliveryFee: true,
            total: true,
            updatedAt: true
        };

        // Pedido entregue credita pontos pro telefone do cliente na mesma transaction,
        // pra não existir pedido entregue sem pontuação.
        if (status === "entregue") {
            const points = Math.floor(order.total / CENTS_PER_POINT);

            const { updated, loyalty } = await prismaClient.$transaction(async (tx) => {
                const updated = await tx.order.update({
                    where: { id: order.id },
                    data: { status },
                    select: orderSelect
                });

                const loyalty = await tx.loyaltyPoint.upsert({
                    where: {
                        tenantId_customerPhone: {
                            tenantId,
                            customerPhone: order.customerPhone
                        }
                    },
                    create: {
                        tenantId,
                        customerPhone: order.customerPhone,
                        points
                    },
                    update: {
                        points: { increment: points }
                    },
                    select: {
                        customerPhone: true,
                        points: true
                    }
                });

                return { updated, loyalty };
            });

            await this.notify(order.id, status);

            return {
                ...updated,
                loyalty: {
                    pointsEarned: points,
                    pointsBalance: loyalty.points
                }
            };
        }

        const updated = await prismaClient.order.update({
            where: { id: order.id },
            data: {
                status,
                // Cancelamento pelo painel não pede motivo (ainda) — só marca
                // quem cancelou, pra diferenciar de cancelamento pelo cliente.
                ...(status === "cancelado" ? { canceledBy: "store" as const } : {})
            },
            select: orderSelect
        });

        await this.notify(order.id, status);

        return updated;
    }

    // Roda depois que o status já foi salvo — falha ao notificar nunca pode
    // impedir a troca de status, que já aconteceu nesse ponto.
    private async notify(orderId: string, status: OrderStatus) {
        try {
            await new SendOrderStatusPushService().execute({ orderId, status });
        } catch {
            // best-effort — nada a fazer aqui além de não propagar.
        }
    }
}

export { UpdateOrderStatusService };
