import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useCart } from "@/hooks/useCart"
import { useCustomerAuth } from "@/hooks/useCustomerAuth"
import { useInstallPrompt } from "@/hooks/useInstallPrompt"
import { isPushSupported } from "@/lib/pushSubscription"
import { getStoreBranding } from "@/lib/storeBranding"
import { hasOrderedAnywhere } from "@/lib/storeMemory"
import { CustomerTourContext, type CustomerTourContextValue } from "@/tour/customerTourContext"
import { buildCustomerSteps, type CustomerTourStep } from "@/tour/customerTourSteps"
import { readTutorialState, writeTutorialState } from "@/tour/tutorialStorage"
import type { StoreMenu } from "@/types"

const INVITE_DELAY_MS = 2000

interface CustomerTourProviderProps {
  menu: StoreMenu
  // Algum painel lateral/modal da loja está aberto (carrinho, menu, conta, produto...).
  panelOpen: boolean
  // Produto (ou "monte sua pizza") aberto: mostra que o cliente já entendeu.
  productOpen: boolean
  // O card de instalar o app está na tela: o convite espera ele sair.
  installCardVisible: boolean
  children: ReactNode
}

export function CustomerTourProvider({
  menu,
  panelOpen,
  productOpen,
  installCardVisible,
  children,
}: CustomerTourProviderProps) {
  const { totalCount } = useCart()
  const { isAuthenticated } = useCustomerAuth()
  const { canInstall } = useInstallPrompt()

  const [steps, setSteps] = useState<CustomerTourStep[] | null>(null)
  const [index, setIndex] = useState(0)
  const [stored, setStored] = useState(readTutorialState)
  const [orderedBefore] = useState(hasOrderedAnywhere)
  const [inviteVisible, setInviteVisible] = useState(false)
  const originFocus = useRef<HTMLElement | null>(null)

  const active = steps !== null
  const hasProducts = menu.categories.some((category) => category.products.length > 0 || category.sizes.length > 0)

  // Convite só para quem nunca viu o tutorial, a loja tem o que ensinar, o
  // cliente ainda não começou a pedir e nada mais está na tela.
  const eligible =
    stored === null &&
    hasProducts &&
    !active &&
    !panelOpen &&
    !productOpen &&
    !installCardVisible &&
    totalCount === 0 &&
    !isAuthenticated &&
    !orderedBefore

  useEffect(() => {
    if (!eligible) {
      setInviteVisible(false)
      return
    }

    const timer = window.setTimeout(() => setInviteVisible(true), INVITE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [eligible])

  const remember = useCallback((status: "dismissed" | "completed") => {
    writeTutorialState(status)
    setStored(status)
  }, [])

  // O cliente já entendeu: pôs algo no carrinho ou abriu um produto com o convite à vista.
  useEffect(() => {
    if (inviteVisible && (totalCount > 0 || productOpen)) {
      remember("dismissed")
      setInviteVisible(false)
    }
  }, [inviteVisible, totalCount, productOpen, remember])

  const dismissInvite = useCallback(() => {
    remember("dismissed")
    setInviteVisible(false)
  }, [remember])

  const restoreFocus = useCallback(() => {
    const target = originFocus.current
    originFocus.current = null

    window.setTimeout(() => {
      if (target && target !== document.body && target.isConnected) {
        target.focus()
        return
      }

      // O foco de origem não existe mais (ex.: item do menu que fechou): volta ao botão do menu.
      const menuButton = document.querySelector<HTMLElement>('[data-tour="menu-button"]')
      if (menuButton) {
        menuButton.focus()
        return
      }
      const main = document.querySelector<HTMLElement>("main")
      main?.setAttribute("tabindex", "-1")
      main?.focus({ preventScroll: true })
    }, 200)
  }, [])

  const startTour = useCallback(() => {
    if (steps) return

    const { isBasico } = getStoreBranding(menu.tenant)
    const built = buildCustomerSteps({
      tenant: menu.tenant,
      categories: menu.categories,
      isBasico,
      isAuthenticated,
      canInstall,
      pushSupported: isPushSupported() && !isBasico,
    })

    originFocus.current = document.activeElement as HTMLElement | null
    setInviteVisible(false)
    setIndex(0)
    setSteps(built)

    // Os passos fazem mais sentido a partir do topo do cardápio.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
  }, [steps, menu, isAuthenticated, canInstall])

  const stopTour = useCallback(
    (status: "dismissed" | "completed") => {
      remember(status)
      setSteps(null)
      restoreFocus()
    },
    [remember, restoreFocus]
  )

  const next = useCallback(() => {
    if (!steps) return
    if (index >= steps.length - 1) stopTour("completed")
    else setIndex(index + 1)
  }, [steps, index, stopTour])

  const back = useCallback(() => setIndex((current) => Math.max(0, current - 1)), [])

  const value = useMemo<CustomerTourContextValue>(
    () => ({
      active,
      steps: steps ?? [],
      index,
      startTour,
      stopTour,
      next,
      back,
      inviteVisible,
      dismissInvite,
    }),
    [active, steps, index, startTour, stopTour, next, back, inviteVisible, dismissInvite]
  )

  return <CustomerTourContext.Provider value={value}>{children}</CustomerTourContext.Provider>
}
