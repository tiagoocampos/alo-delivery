import { useEffect, type CSSProperties, type ReactNode } from "react"
import { Check, Minus, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useVisualViewportHeight } from "@/hooks/useVisualViewportHeight"

interface ItemModalProps {
  label: string
  title: string
  description?: string | null
  onClose: () => void
  headerActions?: ReactNode
  footer: ReactNode
  children: ReactNode
}

// Casca escura dos modais de personalização (produto e pizza): tela cheia no
// celular, centralizada em telas grandes, corpo com rolagem própria e rodapé
// sempre visível.
export function ItemModal({ label, title, description, onClose, headerActions, footer, children }: ItemModalProps) {
  const viewportHeight = useVisualViewportHeight()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [onClose])

  const style = { "--vvh": viewportHeight ? `${viewportHeight}px` : "100dvh" } as CSSProperties

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-modal-title"
        style={style}
        onClick={(event) => event.stopPropagation()}
        className="flex h-(--vvh) w-full flex-col overflow-hidden bg-brand-dark text-on-dark animate-in fade-in slide-in-from-bottom-4 duration-200 sm:h-auto sm:max-h-[90dvh] sm:max-w-lg sm:rounded-3xl"
      >
        <div className="flex items-start gap-1 px-4 pb-3 pt-4">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent-title">{label}</span>
            <h1 id="item-modal-title" className="mt-1 font-heading text-4xl leading-[1.02] text-on-dark">
              {title}
            </h1>
            {description && <p className="mt-1.5 text-sm leading-relaxed text-on-dark-muted">{description}</p>}
          </div>

          <div className="-mr-2 -mt-1 flex shrink-0 items-center">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="flex size-11 items-center justify-center rounded-full text-on-dark hover:bg-white/10"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-4 pb-4">
          {children}
        </div>

        <div className="shrink-0 border-t border-white/10 bg-brand-dark px-3 pb-safe pt-3">
          <div className="flex items-center gap-3 pb-3">{footer}</div>
        </div>
      </div>
    </div>
  )
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-xs font-extrabold uppercase tracking-widest text-on-dark">{children}</h2>
      {hint && (
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-on-dark-muted">{hint}</span>
      )}
    </div>
  )
}

interface OptionButtonProps {
  kind: "radio" | "check"
  selected: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
  trailing?: ReactNode
}

export function OptionButton({ kind, selected, disabled, onClick, children, trailing }: OptionButtonProps) {
  return (
    <button
      type="button"
      role={kind === "radio" ? "radio" : "checkbox"}
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex min-h-14 w-full items-center gap-3 rounded-2xl border px-3.5 py-2 text-left text-sm transition-colors",
        selected ? "border-accent-title bg-white/10" : "border-white/15 bg-white/5 hover:bg-white/10",
        disabled && "opacity-40"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-6 shrink-0 items-center justify-center border-2",
          kind === "radio" ? "rounded-full" : "rounded-md",
          selected ? "border-accent-title bg-accent-title text-brand-dark" : "border-white/40"
        )}
      >
        {selected && <Check className="size-4" strokeWidth={3.5} />}
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-3 font-semibold">{children}</span>
      {trailing && <span className="shrink-0 text-sm font-bold text-accent-title">{trailing}</span>}
    </button>
  )
}

export function QuantityStepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex shrink-0 items-center rounded-full border border-white/20">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Diminuir quantidade"
        className="flex size-11 items-center justify-center rounded-full hover:bg-white/10"
      >
        <Minus className="size-4" />
      </button>
      <span className="w-7 text-center text-base font-extrabold" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Aumentar quantidade"
        className="flex size-11 items-center justify-center rounded-full hover:bg-white/10"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}

interface AddButtonProps {
  label: string
  // Versão curta para telas estreitas, onde o rótulo + preço não cabem.
  shortLabel?: string
  price?: string
  disabled?: boolean
  onClick: () => void
}

export function AddButton({ label, shortLabel, price, disabled, onClick }: AddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-12 min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl bg-primary px-4 text-base font-bold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
    >
      {shortLabel ? (
        <>
          <span className="truncate min-[420px]:hidden">{shortLabel}</span>
          <span className="hidden truncate min-[420px]:inline">{label}</span>
        </>
      ) : (
        <span className="truncate">{label}</span>
      )}
      {price && <span className="shrink-0 font-extrabold">{price}</span>}
    </button>
  )
}
