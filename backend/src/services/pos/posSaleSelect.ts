// Formato único de venda de balcão devolvido por POST /pos/sales,
// GET /pos/sales e PATCH /pos/sales/:id/cancel.
export const posSaleSelect = {
    id: true,
    createdAt: true,
    status: true,
    paymentMethod: true,
    total: true,
    cancelReason: true,
    items: {
        select: {
            name: true,
            quantity: true,
            unitPrice: true,
            extras: {
                select: {
                    name: true,
                    price: true
                }
            }
        }
    }
} as const;
