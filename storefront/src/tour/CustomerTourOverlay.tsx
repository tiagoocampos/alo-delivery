import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { computeAnchoredPlacement, computePlacement, type Box, type Size } from "@/tour/placement"
import { useCustomerTour } from "@/tour/useCustomerTour"
import type { CustomerTourStep } from "@/tour/customerTourSteps"
import { BuildItemIllustration } from "@/tour/illustrations/BuildItemIllustration"
import { CheckoutIllustration } from "@/tour/illustrations/CheckoutIllustration"
import { TrackingIllustration } from "@/tour/illustrations/TrackingIllustration"

const MOBILE_QUERY = "(max-width: 639px)"
const HIGHLIGHT_PADDING = 6
const WAIT_FOR_TARGET_MS = 1400
const MARGIN = 12

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY)
    const onChange = () => setIsMobile(query.matches)
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  return isMobile
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function visibleBox(element: Element | null): Box | null {
  if (!element) return null
  const rect = element.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return null // invisível = como se não existisse
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
}

// União das áreas dos alvos visíveis (o passo da busca destaca busca + categorias).
function unionBox(elements: (Element | null)[]): { box: Box | null; first: Element | null } {
  const found = elements
    .map((element) => ({ element, box: visibleBox(element) }))
    .filter((entry): entry is { element: Element; box: Box } => entry.box !== null)

  if (found.length === 0) return { box: null, first: null }

  const left = Math.min(...found.map(({ box }) => box.left))
  const top = Math.min(...found.map(({ box }) => box.top))
  const right = Math.max(...found.map(({ box }) => box.left + box.width))
  const bottom = Math.max(...found.map(({ box }) => box.top + box.height))

  return { box: { left, top, width: right - left, height: bottom - top }, first: found[0]!.element }
}

const sameBox = (a: Box | null, b: Box | null) =>
  a === b ||
  (a !== null &&
    b !== null &&
    Math.round(a.left) === Math.round(b.left) &&
    Math.round(a.top) === Math.round(b.top) &&
    Math.round(a.width) === Math.round(b.width) &&
    Math.round(a.height) === Math.round(b.height))

// **trecho** vira negrito.
function RichText({ text }: { text: string }): ReactNode {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-foreground">
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  )
}

function Illustration({ step }: { step: CustomerTourStep }) {
  switch (step.illustration?.id) {
    case "montar":
      return <BuildItemIllustration />
    case "finalizar":
      return <CheckoutIllustration methods={step.illustration.methods ?? []} />
    case "acompanhar":
      return <TrackingIllustration stages={step.illustration.stages ?? []} />
    default:
      return null
  }
}

interface StepViewProps {
  step: CustomerTourStep
  index: number
  total: number
  isMobile: boolean
}

// Um passo: destaca o alvo (se existir e estiver visível) e posiciona o balão.
// Remonta a cada passo (key), então a espera pelo alvo recomeça limpa.
function StepView({ step, index, total, isMobile }: StepViewProps) {
  const { next, back, stopTour } = useCustomerTour()

  const [target, setTarget] = useState<Box | null>(null)
  const [waited, setWaited] = useState(!step.targets)
  const [size, setSize] = useState<Size>({ width: 360, height: 240 })
  const [viewport, setViewport] = useState<Size>({ width: window.innerWidth, height: window.innerHeight })
  const scrolledRef = useRef(false)
  const balloonRef = useRef<HTMLDivElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)

  const measure = useCallback(() => {
    setViewport((current) =>
      current.width === window.innerWidth && current.height === window.innerHeight
        ? current
        : { width: window.innerWidth, height: window.innerHeight }
    )

    const { box, first } = unionBox(step.targets?.() ?? [])

    // Leva o alvo para a vista na primeira vez que ele aparece.
    if (first && box && !scrolledRef.current) {
      scrolledRef.current = true
      const inView = box.top >= 0 && box.top + box.height <= window.innerHeight
      if (!inView) first.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" })
    }

    setTarget((current) => (sameBox(current, box) ? current : box))
    if (box) setWaited(true)
  }, [step])

  // Acompanha rolagem, redimensionamento e mudanças de layout.
  useEffect(() => {
    measure()
    const interval = window.setInterval(measure, 200)
    const giveUp = window.setTimeout(() => setWaited(true), WAIT_FOR_TARGET_MS)

    window.addEventListener("resize", measure)
    window.addEventListener("scroll", measure, true)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(giveUp)
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", measure, true)
    }
  }, [measure])

  useLayoutEffect(() => {
    const node = balloonRef.current
    if (!node) return

    const update = () => {
      const rect = node.getBoundingClientRect()
      setSize((current) =>
        Math.round(current.width) === Math.round(rect.width) && Math.round(current.height) === Math.round(rect.height)
          ? current
          : { width: rect.width, height: rect.height }
      )
    }
    update()

    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // O foco vai para o botão principal assim que o balão aparece.
  useEffect(() => {
    if (waited) primaryRef.current?.focus({ preventScroll: true })
  }, [waited])

  const highlight: Box | null = target && {
    left: target.left - HIGHLIGHT_PADDING,
    top: target.top - HIGHLIGHT_PADDING,
    width: target.width + HIGHLIGHT_PADDING * 2,
    height: target.height + HIGHLIGHT_PADDING * 2,
  }

  // Celular: cartão encostado embaixo ou em cima. Desktop: ao lado do alvo.
  const anchored = computeAnchoredPlacement(highlight, size.height, viewport.height, { margin: MARGIN })
  const placement = computePlacement(highlight, size, viewport, { margin: MARGIN })

  const balloonStyle: React.CSSProperties = isMobile
    ? {
        left: MARGIN,
        right: MARGIN,
        ...(anchored.anchor === "bottom"
          ? { bottom: `calc(${MARGIN}px + env(safe-area-inset-bottom))` }
          : anchored.anchor === "top"
            ? { top: `calc(${MARGIN}px + env(safe-area-inset-top))` }
            : { top: Math.max(MARGIN, Math.round((viewport.height - size.height) / 2)) }),
        opacity: waited ? 1 : 0,
      }
    : { left: placement.left, top: placement.top, width: 380, opacity: waited ? 1 : 0 }

  const isFirst = index === 0
  const isLast = index === total - 1
  const titleId = `customer-tour-title-${step.id}`
  const textId = `customer-tour-text-${step.id}`

  function trapTab(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return

    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])")
    )
    if (focusable.length === 0) return

    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="fixed inset-0 z-[100]" data-customer-tour-layer>
      {/* Bloqueia toques na página: nada vira pedido durante o tour. */}
      <div className="absolute inset-0" aria-hidden />

      {highlight ? (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-2xl ring-2 ring-primary"
          style={{
            left: highlight.left,
            top: highlight.top,
            width: highlight.width,
            height: highlight.height,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.66)",
          }}
        />
      ) : (
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/65" />
      )}

      <div
        ref={balloonRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={textId}
        onKeyDown={trapTab}
        className="absolute flex max-h-[calc(100dvh-24px)] flex-col gap-3 overflow-y-auto rounded-3xl bg-card p-4 text-card-foreground shadow-2xl ring-1 ring-border motion-safe:transition-opacity motion-safe:duration-200"
        style={balloonStyle}
      >
        <div aria-live="polite" aria-atomic="true" className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Passo {index + 1} de {total}
            </p>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted" aria-hidden>
              <div className="h-full rounded-full bg-primary" style={{ width: `${((index + 1) / total) * 100}%` }} />
            </div>
          </div>
          <h2 id={titleId} className="font-heading text-xl text-accent-heading">
            {step.title}
          </h2>
          <p id={textId} className="text-sm leading-relaxed text-muted-foreground">
            <RichText text={step.body} />
          </p>
          {step.list && (
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              {step.list.map((item) => (
                <li key={item}>
                  <RichText text={item} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <Illustration step={step} />

        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => stopTour("dismissed")}
            className="min-h-11 rounded-md px-1 text-sm font-semibold text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Pular
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={back}
              disabled={isFirst}
              className="min-h-11 rounded-full border border-border px-4 text-sm font-semibold text-foreground disabled:opacity-40"
            >
              Voltar
            </button>
            <button
              ref={primaryRef}
              type="button"
              onClick={next}
              className="min-h-11 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground"
            >
              {isLast ? "Entendi" : "Próximo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Montado uma vez enquanto o tour está aberto: isola a página, trata o teclado
// e troca o passo.
function TourSession() {
  const { steps, index, next, back, stopTour } = useCustomerTour()
  const isMobile = useIsMobile()
  const step = steps[index]

  // A página fica inerte (sem foco nem leitor de tela) enquanto o tour está
  // aberto; o balão mora fora do #root, então continua acessível.
  useEffect(() => {
    const root = document.getElementById("root")
    if (!root) return
    root.inert = true
    return () => {
      root.inert = false
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        stopTour("dismissed")
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        next()
      } else if (event.key === "ArrowLeft") {
        event.preventDefault()
        back()
      } else if (event.key === "Enter") {
        // Em botões e links o Enter já faz a própria ação.
        const focused = document.activeElement
        if (!(focused instanceof HTMLButtonElement) && !(focused instanceof HTMLAnchorElement)) {
          event.preventDefault()
          next()
        }
      }
    }

    document.addEventListener("keydown", onKeyDown, true)
    return () => document.removeEventListener("keydown", onKeyDown, true)
  }, [next, back, stopTour])

  if (!step) return null

  return <StepView key={step.id} step={step} index={index} total={steps.length} isMobile={isMobile} />
}

export function CustomerTourOverlay() {
  const { active } = useCustomerTour()

  if (!active) return null

  return createPortal(<TourSession />, document.body)
}
