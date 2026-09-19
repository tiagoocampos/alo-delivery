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

// Plano básico não mostra o acompanhamento granular do pedido (a etapa atual)
// pro cliente final — só a confirmação de que a loja recebeu. "cancelado" é
// exceção: não é "acompanhamento", é um resultado final que já tem aviso
// próprio (motivo do cancelamento) em outro lugar da tela, então escondê-lo
// só deixaria a tela contraditória.
export function getVisibleOrderStatusLabel(status: string, effectivePlan: "completo" | "basico"): string {
  if (effectivePlan === "completo" || status === "cancelado") {
    return getOrderStatusLabel(status)
  }

  return "Recebido"
}
