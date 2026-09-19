import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { X } from "lucide-react"
import { StoreHeader } from "@/components/StoreHeader"
import { SearchBar } from "@/components/SearchBar"
import { CategoryList } from "@/components/CategoryList"
import { ProductList } from "@/components/ProductList"
import { ProductDetailScreen } from "@/components/ProductDetailScreen"
import { CategoryOrderScreen } from "@/components/CategoryOrderScreen"
import { CartBar } from "@/components/CartBar"
import { CartSheet } from "@/components/CartSheet"
import { StoreFooter } from "@/components/StoreFooter"
import { NavMenuSheet } from "@/components/NavMenuSheet"
import { LoyaltySheet } from "@/components/LoyaltySheet"
import { AccountSheet } from "@/components/AccountSheet"
import { OrdersSheet } from "@/components/OrdersSheet"
import { OrderConfirmation } from "@/components/OrderConfirmation"
import { MenuSkeleton } from "@/components/MenuSkeleton"
import { CartProvider } from "@/context/CartContext"
import { CustomerAuthProvider } from "@/context/CustomerAuthContext"
import { useCart } from "@/hooks/useCart"
import { getStoreMenu } from "@/services/storefront"
import { applyTenantManifest } from "@/lib/pwaManifest"
import type { Category, Order, Product, StoreMenu } from "@/types"

function StorefrontContent({ slug }: { slug: string }) {
  const [menu, setMenu] = useState<StoreMenu | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [search, setSearch] = useState("")
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  const [selectedProduct, setSelectedProduct] = useState<{ product: Product; categoryName: string } | null>(
    null
  )
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [navOpen, setNavOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [loyaltyOpen, setLoyaltyOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [ordersOpen, setOrdersOpen] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)

  const { totalCount, subtotal } = useCart()

  useEffect(() => {
    let active = true
    setLoading(true)
    setNotFound(false)

    getStoreMenu(slug)
      .then((data) => {
        if (active) setMenu(data)
      })
      .catch(() => {
        if (active) setNotFound(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [slug])

  useEffect(() => {
    if (!menu?.tenant) return

    const link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
    if (!link) return

    // Plano básico ignora o favicon da loja, igual já fazemos com logo/banner
    // — usa o favicon do próprio Alô Delivery mesmo que o tenant tenha um
    // configurado.
    if (menu.tenant.effectivePlan === "basico") {
      link.href = "/brand/favicon-256x256.png"
      return
    }

    if (menu.tenant.faviconUrl) {
      link.href = menu.tenant.faviconUrl
    }
  }, [menu?.tenant])

  useEffect(() => {
    if (!menu?.tenant.name) return
    document.title = menu.tenant.name
  }, [menu?.tenant.name])

  useEffect(() => {
    if (!menu?.tenant) return

    let cleanup: (() => void) | undefined
    let cancelled = false

    applyTenantManifest(menu.tenant, slug).then((revoke) => {
      if (cancelled) {
        revoke()
      } else {
        cleanup = revoke
      }
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [menu?.tenant, slug])

  const activeCategoryName = useMemo(
    () => menu?.categories.find((category) => category.id === activeCategoryId)?.name ?? null,
    [menu, activeCategoryId]
  )

  const filteredCategories = useMemo(() => {
    if (!menu) return []

    const query = search.trim().toLowerCase()

    return menu.categories
      .filter((category) => activeCategoryId === null || category.id === activeCategoryId)
      .map((category) => {
        // Categorias com tamanho não têm produtos com preço próprio — o card
        // de chamada aparece sempre, independente da busca por texto.
        if (category.sizes.length > 0) return category

        return {
          ...category,
          products: category.products.filter((product) => {
            if (!query) return true
            return (
              product.name.toLowerCase().includes(query) ||
              (product.description ?? "").toLowerCase().includes(query)
            )
          }),
        }
      })
      .filter((category) => category.sizes.length > 0 || category.products.length > 0)
  }, [menu, activeCategoryId, search])

  const mostOrdered = useMemo(() => {
    if (!menu || search.trim() || activeCategoryId !== null) return []

    return menu.categories
      .filter((category) => category.sizes.length === 0)
      .flatMap((category) =>
        category.products
          .filter((product) => product.badge === "mais_pedido")
          .map((product) => ({ product, categoryName: category.name }))
      )
  }, [menu, activeCategoryId, search])

  if (loading) {
    return <MenuSkeleton />
  }

  if (notFound || !menu) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-2 p-6 text-center">
        <h1 className="font-heading text-lg font-semibold text-foreground">Loja não encontrada</h1>
        <p className="text-sm text-muted-foreground">
          Verifique o link ou entre em contato com a loja.
        </p>
      </div>
    )
  }

  if (completedOrder) {
    return (
      <OrderConfirmation
        order={completedOrder}
        slug={slug}
        effectivePlan={menu.tenant.effectivePlan}
        onNewOrder={() => setCompletedOrder(null)}
      />
    )
  }

  return (
    <div className="flex min-h-svh flex-col pb-14">
      <StoreHeader
        tenant={menu.tenant}
        cartCount={totalCount}
        onOpenMenu={() => setNavOpen(true)}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="flex flex-1 flex-col">
        <div className="p-4">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <CategoryList
          categories={menu.categories}
          activeCategoryId={activeCategoryId}
          onSelect={setActiveCategoryId}
        />

        {activeCategoryName && (
          <button
            type="button"
            onClick={() => setActiveCategoryId(null)}
            className="flex items-center justify-between border-b border-border px-3 py-2 text-sm text-foreground"
          >
            <span className="font-medium">{activeCategoryName}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              Ver tudo <X className="size-3.5" />
            </span>
          </button>
        )}

        <ProductList
          categories={filteredCategories}
          mostOrdered={mostOrdered}
          onSelectProduct={(product, categoryName) => setSelectedProduct({ product, categoryName })}
          onSelectCategory={setSelectedCategory}
        />
      </main>

      <StoreFooter tenant={menu.tenant} />

      <CartBar count={totalCount} subtotal={subtotal} onClick={() => setCartOpen(true)} />

      <ProductDetailScreen
        product={selectedProduct?.product ?? null}
        categoryName={selectedProduct?.categoryName ?? ""}
        onClose={() => setSelectedProduct(null)}
      />

      <CategoryOrderScreen category={selectedCategory} onClose={() => setSelectedCategory(null)} />

      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        slug={slug}
        deliveryFee={menu.tenant.deliveryFee}
        minimumOrderValue={menu.tenant.minimumOrderValue}
        pixKey={menu.tenant.pixKey}
        onOrderCreated={setCompletedOrder}
      />

      <NavMenuSheet
        open={navOpen}
        onOpenChange={setNavOpen}
        tenant={menu.tenant}
        onOpenCart={() => setCartOpen(true)}
        onOpenLoyalty={() => setLoyaltyOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
        onOpenOrders={() => setOrdersOpen(true)}
      />

      <LoyaltySheet open={loyaltyOpen} onOpenChange={setLoyaltyOpen} slug={slug} />
      <AccountSheet open={accountOpen} onOpenChange={setAccountOpen} slug={slug} />
      <OrdersSheet
        open={ordersOpen}
        onOpenChange={setOrdersOpen}
        slug={slug}
        effectivePlan={menu.tenant.effectivePlan}
      />
    </div>
  )
}

export function StorefrontPage() {
  const { slug } = useParams<{ slug: string }>()

  if (!slug) return null

  return (
    <CustomerAuthProvider slug={slug}>
      <CartProvider>
        <StorefrontContent slug={slug} />
      </CartProvider>
    </CustomerAuthProvider>
  )
}
