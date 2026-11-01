import type { Prisma } from "../generated/prisma/client.js";

// Filtro único do que conta como pedido "de faturamento" num intervalo de datas.
// - online: dia pelo createdAt, qualquer status menos cancelado.
// - balcão: dia pelo closedAt (mesa aberta às 23h e fechada às 00h30 conta no
//   dia do fechamento); só conta fechada ("entregue"). Mesa "aberta" não é
//   faturamento, e cancelada nunca entra.
export function revenueOrdersWhere(tenantId: string, start: Date, end: Date): Prisma.OrderWhereInput {
    return {
        tenantId,
        OR: [
            {
                origin: "online",
                status: { not: "cancelado" },
                createdAt: { gte: start, lte: end }
            },
            {
                origin: "balcao",
                status: "entregue",
                closedAt: { gte: start, lte: end }
            }
        ]
    };
}

// Dia (instante) em que o pedido entrou no faturamento.
export function revenueDate(order: { origin: "online" | "balcao"; createdAt: Date; closedAt: Date | null }): Date {
    return order.origin === "balcao" ? (order.closedAt ?? order.createdAt) : order.createdAt;
}
