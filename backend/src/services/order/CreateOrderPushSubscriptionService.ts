import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import { OrderNotFoundError } from "../../errors/order/OrderErrors.js";
import prismaClient from "../../prisma/index.js";

interface CreateOrderPushSubscriptionServiceProps {
    slug: string;
    orderId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
}

class CreateOrderPushSubscriptionService {
    async execute({ slug, orderId, endpoint, p256dh, auth }: CreateOrderPushSubscriptionServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        // Inscrição vinculada ao pedido, não a uma conta — funciona pra
        // pedido de convidado também. Só confirma que o pedido é dessa loja.
        const order = await prismaClient.order.findFirst({
            where: {
                id: orderId,
                tenantId: tenant.id
            },
            select: { id: true }
        });

        if (!order) {
            throw new OrderNotFoundError();
        }

        const subscription = await prismaClient.orderPushSubscription.create({
            data: {
                orderId: order.id,
                endpoint,
                p256dhKey: p256dh,
                authKey: auth
            },
            select: {
                id: true,
                orderId: true,
                createdAt: true
            }
        });

        return subscription;
    }
}

export { CreateOrderPushSubscriptionService };
