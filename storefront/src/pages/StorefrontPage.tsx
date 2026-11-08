import { lazy, Suspense, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useParams } from "react-router-dom"
import { StoreHeader } from "@/components/StoreHeader"
import { StoreHero } from "@/components/StoreHero"
import { StoreInfoCards } from "@/components/StoreInfoCards"
import { InstallAppCard } from "@/components/InstallAppCard"
import { MenuTitle } from "@/components/MenuTitle"
import { SearchBar } from "@/components/SearchBar"
import { CategoryList } from "@/components/CategoryList"
import { QuickFilters } from "@/components/QuickFilters"
import { ProductList } from "@/components/ProductList"
import { BottomBar } from "@/components/BottomBar"
import { StoreFooter } from "@/components/StoreFooter"
import { MenuSkeleton } from "@/components/MenuSkeleton"
import { CustomerTourProvider } from "@/tour/CustomerTourProvider"
import { CustomerTourInvite } from "@/tour/CustomerTourInvite"
import { CustomerTourOverlay } from "@/tour/CustomerTourOverlay"
import { CartProvider } from "@/context/CartContext"
import { CustomerAuthProvider } from "@/context/CustomerAuthContext"
import { FavoritesProvider } from "@/context/FavoritesContext"
import { useCart } from "@/hooks/useCart"
import { useFavorites } from "@/hooks/useFavorites"
import { useStoreTheme } from "@/hooks/useStoreTheme"
import { useFontsReady } from "@/hooks/useFontsReady"
import { useBannerInfo } from "@/hooks/useBannerInfo"
import { getStoreBranding } from "@/lib/storeBranding"
import { useMountOnFirstOpen } from "@/hooks/useMountOnFirstOpen"
import { getStoreMenu } from "@/services/storefront"
import { applyTenantManifest } from "@/lib/pwaManifest"
import { formatCents } from "@/lib/money"
import { scrollToId } from "@/lib/scroll"
import { hasOrderedBefore, markOrdered } from "@/lib/storeMemory"
import {
  buildSearchPlaceholder,
  getPriceCeiling,
  getQuickFilterOptions,
  matchesQuickFilter,
  type QuickFilter,
} from "@/lib/menuFilters"
import type { Category, Order, Product, StoreMenu } from "@/types"

// Telas que só aparecem ao toque saem do JS inicial.
const ProductDetailScreen = lazy(() => import("@/components/ProductDetailScreen").then((m) => ({ default: m.ProductDetailScreen })))
const CategoryOrderScreen = lazy(() => import("@/components/CategoryOrderScreen").then((m) => ({ default: m.CategoryOrderScreen })))
const CartSheet = lazy(() => import("@/components/CartSheet").then((m) => ({ default: m.CartSheet })))
const NavMenuSheet = lazy(() => import("@/components/NavMenuSheet").then((m) => ({ default: m.NavMenuSheet })))
const LoyaltySheet = lazy(() => import("@/components/LoyaltySheet").then((m) => ({ default: m.LoyaltySheet })))
const AccountSheet = lazy(() => import("@/components/AccountSheet").then((m) => ({ default: m.AccountSheet })))
const FavoritesSheet = lazy(() => import("@/components/FavoritesSheet").then((m) => ({ default: m.FavoritesSheet })))
const OrdersSheet = lazy(() => import("@/components/OrdersSheet").then((m) => ({ default: m.OrdersSheet })))
const OrderConfirmation = lazy(() => import("@/components/OrderConfirmation").then((m) => ({ default: m.OrderConfirmation })))

function StorefrontContent({ slug }: { slug: string }) {
  const [menu, setMenu] = useState<StoreMenu | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [search, setSearch] = useState("")
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("todos")
  // Cliente que já pediu aqui vê a apresentação da loja recolhida.
  const [returning] = useState(() => hasOrderedBefore(slug))

  const [selectedProduct, setSelectedProduct] = useState<{ product: Product; categoryName: string } | null>(
    null
  )
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [navOpen, setNavOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [loyaltyOpen, setLoyaltyOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [ordersOpen, setOrdersOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)
  const [installCardVisible, setInstallCardVisible] = useState(false)

  const { totalCount, subtotal } = useCart()
  const { orderedIds, isFavorite, guestHintPending, acknowledgeGuestHint } = useFavorites()
  const { ready: themeReady, themeColor } = useStoreTheme(menu?.tenant ?? null)
  const fontsReady = useFontsReady()
  // Proporção e cor das bordas do banner: lidas antes de mostrar a página, para a capa não deslocar o layout.
  const bannerUrl = menu ? getStoreBranding(menu.tenant).bannerUrl : null
  const banner = useBannerInfo(bannerUrl)

  const mountProduct = useMountOnFirstOpen(selectedProduct !== null)
  const mountCategory = useMountOnFirstOpen(selectedCategory !== null)
  const mountCart = useMountOnFirstOpen(cartOpen)
  const mountNav = useMountOnFirstOpen(navOpen)
  const mountLoyalty = useMountOnFirstOpen(loyaltyOpen)
  const mountAccount = useMountOnFirstOpen(accountOpen)
  const mountOrders = useMountOnFirstOpen(ordersOpen)
  const mountFavorites = useMountOnFirstOpen(favoritesOpen)

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

  // Primeiro favorito de quem não tem conta: dica única, com atalho para entrar.
  useEffect(() => {
    if (!guestHintPending) return

    toast("Entre na sua conta para guardar seus favoritos em qualquer aparelho.", {
      duration: 6000,
      action: { label: "Entrar", onClick: () => setAccountOpen(true) },
    })
    acknowledgeGuestHint()
  }, [guestHintPending, acknowledgeGuestHint])

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

    applyTenantManifest(menu.tenant, slug, themeColor).then((revoke) => {
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
  }, [menu?.tenant, slug, themeColor])

  const priceCeiling = useMemo(() => (menu ? getPriceCeiling(menu.categories) : null), [menu])

  // Favoritos que ainda existem no cardápio (produto removido ou desativado some
  // da lista), do mais recente para o mais antigo.
  const favoriteEntries = useMemo(() => {
    if (!menu) return []

    const byId = new Map<string, { product: Product; categoryName: string }>()
    for (const category of menu.categories) {
      if (category.sizes.length > 0) continue
      for (const product of category.products) byId.set(product.id, { product, categoryName: category.name })
    }

    return orderedIds.flatMap((id) => {
      const entry = byId.get(id)
      return entry ? [entry] : []
    })
  }, [menu, orderedIds])

  const hasFavorites = favoriteEntries.length > 0

  const quickOptions = useMemo(
    () => (menu ? getQuickFilterOptions(menu.categories, priceCeiling, hasFavorites, formatCents) : []),
    [menu, priceCeiling, hasFavorites]
  )

  // Se o filtro escolhido deixou de existir (ex.: removeu o último favorito), volta para "Todos".
  const activeQuickFilter: QuickFilter = quickOptions.some((option) => option.id === quickFilter)
    ? quickFilter
    : "todos"

  const searchPlaceholder = useMemo(() => (menu ? buildSearchPlaceholder(menu.categories) : undefined), [menu])

  const filteredCategories = useMemo(() => {
    if (!menu) return []

    const query = search.trim().toLowerCase()

    return menu.categories
      .filter((category) => activeCategoryId === null || category.id === activeCategoryId)
      .map((category) => {
        // Categorias com tamanho não têm produtos com preço próprio — o card
        // de chamada aparece sempre, independente da busca por texto. Com um
        // filtro rápido ligado, ele sai (não há o que filtrar nele).
        if (category.sizes.length > 0) return activeQuickFilter === "todos" ? category : { ...category, products: [] }

        return {
          ...category,
          products: category.products.filter((product) => {
            if (!matchesQuickFilter(activeQuickFilter, product, priceCeiling, isFavorite)) return false
            if (!query) return true
            return (
              product.name.toLowerCase().includes(query) ||
              (product.description ?? "").toLowerCase().includes(query)
            )
          }),
        }
      })
      .filter((category) => category.sizes.length > 0 ? activeQuickFilter === "todos" : category.products.length > 0)
  }, [menu, activeCategoryId, search, activeQuickFilter, priceCeiling, isFavorite])

  const mostOrdered = useMemo(() => {
    if (!menu || search.trim() || activeCategoryId !== null || activeQuickFilter !== "todos") return []

    return menu.categories
      .filter((category) => category.sizes.length === 0)
      .flatMap((category) =>
        category.products
          .filter((product) => product.badge === "mais_pedido")
          .map((product) => ({ product, categoryName: category.name }))
      )
  }, [menu, activeCategoryId, search, activeQuickFilter])

  // Enquanto o tema da loja (derivado da logo) e as fontes não estão prontos,
  // segue o skeleton — assim a cor e a fonte certas já aparecem na primeira
  // pintura, sem piscar nem "pular".
  if (loading || !fontsReady || (menu && (!themeReady || !banner.ready))) {
    return <MenuSkeleton />
  }

  if (notFound || !menu) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-2 bg-background p-6 text-center">
        <h1 className="font-heading text-3xl text-accent-heading">Loja não encontrada</h1>
        <p className="text-sm text-muted-foreground">
          Verifique o link ou entre em contato com a loja.
        </p>
      </div>
    )
  }

  if (completedOrder) {
    return (
      <Suspense fallback={<MenuSkeleton />}>
        <OrderConfirmation
          order={completedOrder}
          slug={slug}
          effectivePlan={menu.tenant.effectivePlan}
          onNewOrder={() => setCompletedOrder(null)}
        />
      </Suspense>
    )
  }

  const handleOrderCreated = (order: Order) => {
    markOrdered(slug)
    setCompletedOrder(order)
  }

  const filtering = search.trim() !== "" || activeCategoryId !== null || activeQuickFilter !== "todos"
  // "Seus favoritos" só na visão "Tudo": sem busca, categoria nem filtro ativos.
  const favoritesVisible = !filtering

  return (
    <CustomerTourProvider
      menu={menu}
      panelOpen={navOpen || cartOpen || loyaltyOpen || accountOpen || ordersOpen || favoritesOpen}
      productOpen={selectedProduct !== null || selectedCategory !== null}
      installCardVisible={installCardVisible}
    >
    <div className="flex min-h-svh flex-col">
      <StoreHeader
        tenant={menu.tenant}
        cartCount={totalCount}
        onOpenMenu={() => setNavOpen(true)}
        onOpenCart={() => setCartOpen(true)}
      />

      <StoreHero tenant={menu.tenant} collapsed={returning} banner={banner} onViewMenu={() => scrollToId("cardapio")} />

      <InstallAppCard tenant={menu.tenant} slug={slug} onVisibleChange={setInstallCardVisible} />

      <CustomerTourInvite />

      <main className="bg-dots flex flex-1 flex-col pb-4">
        {!returning && <StoreInfoCards tenant={menu.tenant} />}

        <MenuTitle />

        <div className="mx-auto w-full max-w-6xl px-4 pb-3" data-tour="busca">
          <SearchBar value={search} onChange={setSearch} placeholder={searchPlaceholder} />
        </div>

        <CategoryList
          categories={menu.categories}
          activeCategoryId={activeCategoryId}
          onSelect={setActiveCategoryId}
        />

        <QuickFilters options={quickOptions} active={activeQuickFilter} onChange={setQuickFilter} />

        <ProductList
          categories={filteredCategories}
          favorites={favoritesVisible ? favoriteEntries : []}
          mostOrdered={mostOrdered}
          emptyMessage={filtering ? "Nenhum produto encontrado com esses filtros." : "O cardápio ainda está vazio."}
          onSelectProduct={(product, categoryName) => setSelectedProduct({ product, categoryName })}
          onSelectCategory={setSelectedCategory}
        />
      </main>

      <StoreFooter tenant={menu.tenant} />

      <BottomBar
        phone={menu.tenant.phone}
        count={totalCount}
        subtotal={subtotal}
        onOpenCart={() => setCartOpen(true)}
      />

      <Suspense fallback={null}>
        {mountProduct && (
          <ProductDetailScreen
            product={selectedProduct?.product ?? null}
            categoryName={selectedProduct?.categoryName ?? ""}
            onClose={() => setSelectedProduct(null)}
          />
        )}

        {mountCategory && (
          <CategoryOrderScreen category={selectedCategory} onClose={() => setSelectedCategory(null)} />
        )}

        {mountCart && (
          <CartSheet
            open={cartOpen}
            onOpenChange={setCartOpen}
            slug={slug}
            deliveryFee={menu.tenant.deliveryFee}
            minimumOrderValue={menu.tenant.minimumOrderValue}
            pixKey={menu.tenant.pixKey}
            onOrderCreated={handleOrderCreated}
          />
        )}

        {mountNav && (
          <NavMenuSheet
            open={navOpen}
            onOpenChange={setNavOpen}
            tenant={menu.tenant}
            onOpenCart={() => setCartOpen(true)}
            onOpenLoyalty={() => setLoyaltyOpen(true)}
            onOpenAccount={() => setAccountOpen(true)}
            onOpenOrders={() => setOrdersOpen(true)}
            onOpenFavorites={() => setFavoritesOpen(true)}
            favoritesCount={favoriteEntries.length}
          />
        )}

        {mountFavorites && (
          <FavoritesSheet
            open={favoritesOpen}
            onOpenChange={setFavoritesOpen}
            entries={favoriteEntries}
            onSelectProduct={(product, categoryName) => setSelectedProduct({ product, categoryName })}
            onOpenAccount={() => setAccountOpen(true)}
          />
        )}

        {mountLoyalty && <LoyaltySheet open={loyaltyOpen} onOpenChange={setLoyaltyOpen} slug={slug} />}
        {mountAccount && <AccountSheet open={accountOpen} onOpenChange={setAccountOpen} slug={slug} />}
        {mountOrders && (
          <OrdersSheet
            open={ordersOpen}
            onOpenChange={setOrdersOpen}
            slug={slug}
            effectivePlan={menu.tenant.effectivePlan}
          />
        )}
      </Suspense>

      <CustomerTourOverlay />
    </div>
    </CustomerTourProvider>
  )
}

export function StorefrontPage() {
  const { slug } = useParams<{ slug: string }>()

  if (!slug) return null

  return (
    <CustomerAuthProvider slug={slug}>
      <CartProvider>
        <FavoritesProvider slug={slug}>
          <StorefrontContent slug={slug} />
        </FavoritesProvider>
      </CartProvider>
    </CustomerAuthProvider>
  )
}
