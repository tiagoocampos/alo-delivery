export interface ProductVariant {
  id: string
  name: string
  priceDelta: number
  maxFlavors: number | null
}

export interface ProductFlavor {
  id: string
  name: string
}

export interface ProductCrust {
  id: string
  name: string
  priceDelta: number
}

export type ProductBadge = "mais_pedido" | "promocao" | "novo"

export interface Product {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  basePrice: number
  badge: ProductBadge | null
  variants: ProductVariant[]
  flavors: ProductFlavor[]
  crusts: ProductCrust[]
}

export interface Category {
  id: string
  name: string
  sortOrder: number
  products: Product[]
}

export interface BusinessHoursDay {
  dayOfWeek: number
  isClosed: boolean
  opensAt: string | null
  closesAt: string | null
}

export interface Tenant {
  id: string
  name: string
  slug: string
  phone: string | null
  deliveryFee: number
  logoUrl: string | null
  bannerUrl: string | null
  faviconUrl: string | null
  description: string | null
  address: string | null
  instagramUrl: string | null
  minimumOrderValue: number
  businessHours: BusinessHoursDay[] | null
}

export interface StoreMenu {
  tenant: Tenant
  categories: Category[]
}

export type PaymentMethod = "pix_manual" | "na_entrega"

export interface CartItem {
  key: string
  productId: string
  productName: string
  categoryName: string
  variantId?: string
  variantName?: string
  flavorIds?: string[]
  flavorNames?: string[]
  crustId?: string
  crustName?: string
  unitPrice: number
  quantity: number
  note?: string
  imageUrl: string | null
}

export interface CreateOrderItemInput {
  productId: string
  variantId?: string
  flavorIds?: string[]
  crustId?: string
  quantity: number
  note?: string
}

export interface CreateOrderPayload {
  customerName: string
  customerPhone: string
  address: string
  paymentMethod: PaymentMethod
  items: CreateOrderItemInput[]
}

export interface OrderItemResult {
  id: string
  quantity: number
  unitPrice: number
  note: string | null
  selectedFlavors: string[] | null
  product: { id: string; name: string }
  variant: { id: string; name: string } | null
  crust: { id: string; name: string } | null
}

export interface Order {
  id: string
  tenantId: string
  customerId?: string | null
  customerName: string
  customerPhone: string
  address: string
  status: string
  subtotal: number
  deliveryFee: number
  total: number
  paymentMethod: PaymentMethod
  createdAt: string
  items: OrderItemResult[]
}

export interface LoyaltyInfo {
  customerPhone: string
  points: number
  updatedAt: string | null
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
}

export interface Address {
  id: string
  customerId: string
  label: string | null
  street: string
  number: string
  complement: string | null
  neighborhood: string | null
  city: string | null
  isDefault: boolean
}

export interface CustomerAuthResult {
  token: string
  customer: Customer
}

export interface RegisterCustomerPayload {
  name: string
  phone: string
  email?: string
  password: string
}

export interface LoginCustomerPayload {
  phone: string
  password: string
}

export interface AddressPayload {
  label?: string
  street: string
  number: string
  complement?: string
  neighborhood?: string
  city?: string
  isDefault?: boolean
}

export interface CustomerOrder {
  id: string
  customerName: string
  customerPhone: string
  address: string
  status: string
  subtotal: number
  deliveryFee: number
  total: number
  paymentMethod: PaymentMethod
  createdAt: string
  updatedAt: string
  items: OrderItemResult[]
}
