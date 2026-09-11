import { api } from "@/services/api"
import { getCustomerSession } from "@/lib/customerSession"
import type {
  Address,
  AddressPayload,
  Customer,
  CustomerAuthResult,
  CustomerOrder,
  LoginCustomerPayload,
  RegisterCustomerPayload,
} from "@/types"

function authHeaders(slug: string) {
  const session = getCustomerSession(slug)
  return session ? { Authorization: `Bearer ${session.token}` } : undefined
}

export async function registerCustomer(
  slug: string,
  payload: RegisterCustomerPayload
): Promise<CustomerAuthResult> {
  const { data } = await api.post<CustomerAuthResult>(`/store/${slug}/customer/register`, payload)
  return data
}

export async function loginCustomer(
  slug: string,
  payload: LoginCustomerPayload
): Promise<CustomerAuthResult> {
  const { data } = await api.post<CustomerAuthResult>(`/store/${slug}/customer/login`, payload)
  return data
}

export async function getCustomerMe(slug: string): Promise<Customer> {
  const { data } = await api.get<Customer>(`/store/${slug}/customer/me`, {
    headers: authHeaders(slug),
  })
  return data
}

export async function listAddresses(slug: string): Promise<Address[]> {
  const { data } = await api.get<Address[]>(`/store/${slug}/customer/addresses`, {
    headers: authHeaders(slug),
  })
  return data
}

export async function createAddress(slug: string, payload: AddressPayload): Promise<Address> {
  const { data } = await api.post<Address>(`/store/${slug}/customer/addresses`, payload, {
    headers: authHeaders(slug),
  })
  return data
}

export async function updateAddress(
  slug: string,
  addressId: string,
  payload: Partial<AddressPayload>
): Promise<Address> {
  const { data } = await api.put<Address>(`/store/${slug}/customer/addresses/${addressId}`, payload, {
    headers: authHeaders(slug),
  })
  return data
}

export async function deleteAddress(slug: string, addressId: string): Promise<void> {
  await api.delete(`/store/${slug}/customer/addresses/${addressId}`, {
    headers: authHeaders(slug),
  })
}

export async function listCustomerOrders(slug: string): Promise<CustomerOrder[]> {
  const { data } = await api.get<CustomerOrder[]>(`/store/${slug}/customer/orders`, {
    headers: authHeaders(slug),
  })
  return data
}
