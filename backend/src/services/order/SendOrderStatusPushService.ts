import webpush from "../../config/webpush.js";
import prismaClient from "../../prisma/index.js";
import type { OrderStatus } from "../../generated/prisma/enums.js";

const statusMessages: Record<string, string> = {
    preparo: "Seu pedido está sendo preparado!",
    transporte: "Seu pedido saiu para entrega!",
    entregue: "Seu pedido foi entregue. Bom apetite!",
    cancelado: "Seu pedido foi cancelado."
};

interface SendOrderStatusPushServiceProps {
    orderId: string;
    status: OrderStatus;
}

// Roda depois que o status já foi salvo com sucesso — uma falha aqui nunca
// pode impedir a troca de status em si, é só um efeito colateral best-effort.
class SendOrderStatusPushService {
    async execute({ orderId, status }: SendOrderStatusPushServiceProps) {

        const subscriptions = await prismaClient.orderPushSubscription.findMany({
            where: { orderId }
        });

        for (const subscription of subscriptions) {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.p256dhKey,
                            auth: subscription.authKey
                        }
                    },
                    JSON.stringify({
                        title: "Alô Delivery",
                        body: statusMessages[status] ?? "Seu pedido foi atualizado."
                    })
                );
            } catch (error: any) {
                // Inscrição expirada/revogada: apaga pra não acumular lixo.
                if (error?.statusCode === 410) {
                    await prismaClient.orderPushSubscription.delete({
                        where: { id: subscription.id }
                    }).catch(() => {});
                }
            }
        }
    }
}

export { SendOrderStatusPushService };
