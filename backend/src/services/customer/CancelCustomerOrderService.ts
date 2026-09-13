import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import { CustomerTenantMismatchError } from "../../errors/customer/CustomerErrors.js";
import { OrderCannotBeCanceledError, OrderNotFoundError } from "../../errors/order/OrderErrors.js";
import prismaClient from "../../prisma/index.js";

interface CancelCustomerOrderServiceProps {
    slug: string;
    orderId: string;
    customerId: string;
    customerTenantId: string;
    reason: string;
}

class CancelCustomerOrderService {
    // Dupla checagem por design, mesmo padrão do ListCustomerOrdersService: o
    // cliente só cancela pedido dele (customerId do token) e só dentro da
    // loja resolvida pelo slug da URL (tenantId).
    async execute({ slug, orderId, customerId, customerTenantId, reason }: CancelCustomerOrderServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        if (customerTenantId !== tenant.id) {
            throw new CustomerTenantMismatchError();
        }

        const order = await prismaClient.order.findFirst({
            where: {
                id: orderId,
                tenantId: tenant.id,
                customerId
            },
            select: {
                id: true,
                status: true
            }
        });

        if (!order) {
            throw new OrderNotFoundError();
        }

        // Cliente só cancela enquanto a loja ainda não começou o preparo —
        // depois disso, cancelamento unilateral desperdiça comida em produção.
        if (order.status !== "novo") {
            throw new OrderCannotBeCanceledError(order.status);
        }

        const updated = await prismaClient.order.update({
            where: { id: order.id },
            data: {
                status: "cancelado",
                canceledBy: "customer",
                cancelReason: reason
            },
            select: {
                id: true,
                status: true,
                cancelReason: true,
                canceledBy: true,
                updatedAt: true
            }
        });

        return updated;
    }
}

export { CancelCustomerOrderService };
