const ORDER_STATUS_LABELS: Record<string, string> = {
  novo: "Recebido",
  preparo: "Em preparo",
  transporte: "Saiu para entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
}

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status
}
