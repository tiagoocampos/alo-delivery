import { api } from "@/services/api"
import { getCustomerSession } from "@/lib/customerSession"
import type { CreateOrderPayload, LoyaltyInfo, Order, StoreMenu, Tenant } from "@/types"

export async function getTenant(slug: string): Promise<Tenant> {
  const { data } = await api.get<Tenant>(`/tenant/${slug}`)
  return data
}

export async function getStoreMenu(slug: string): Promise<StoreMenu> {
  const { data } = await api.get<StoreMenu>(`/store/${slug}/menu`)
  return data
}

export async function createOrder(slug: string, payload: CreateOrderPayload): Promise<Order> {
  const session = getCustomerSession(slug)

  const { data } = await api.post<Order>(`/store/${slug}/orders`, payload, {
    headers: session ? { Authorization: `Bearer ${session.token}` } : undefined,
  })
  return data
}

export async function getLoyaltyPoints(slug: string, customerPhone: string): Promise<LoyaltyInfo> {
  const { data } = await api.get<LoyaltyInfo>(`/store/${slug}/loyalty`, {
    params: { customerPhone },
  })
  return data
}
