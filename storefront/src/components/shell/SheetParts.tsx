import type { ReactNode } from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Círculo tonal do ícone: o mesmo dos cartões de informação da home.
export function TonalIcon({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-accent-title",
        className
      )}
    >
      <Icon className="size-[18px]" strokeWidth={2} aria-hidden />
    </span>
  )
}

// Título pequeno de seção (Loja, Minha conta...), em fonte de título.
export function SheetSectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("px-4 pb-2 pt-1 font-heading text-sm text-accent-heading", className)}>{children}</h3>
}

// Grupo de linhas em um cartão da cor de superfície, com divisores.
export function SheetGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-4 overflow-hidden rounded-2xl bg-surface text-on-dark shadow-sm [&>*+*]:border-t [&>*+*]:border-white/10", className)}>
      {children}
    </div>
  )
}

interface MenuRowProps {
  icon: LucideIcon
  label: string
  onClick?: () => void
  href?: string
  count?: number
  // Mostra a seta à direita (linha que abre outra tela).
  chevron?: boolean
  active?: boolean
  external?: boolean
}

const ROW =
  "flex min-h-14 w-full items-center gap-3 px-3 py-2 text-left text-on-dark transition-colors hover:bg-white/5 focus-visible:bg-white/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring"

// Linha de menu: ícone tonal, rótulo, contador opcional e seta.
export function MenuRow({ icon, label, onClick, href, count, chevron = true, active, external }: MenuRowProps) {
  const content = (
    <>
      <TonalIcon icon={icon} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold tabular-nums text-primary-foreground">
          {count}
        </span>
      )}
      {chevron && <ChevronRight className="size-4 shrink-0 text-on-dark-muted" aria-hidden />}
    </>
  )

  const className = cn(ROW, active && "bg-white/10")

  if (href) {
    return (
      <a
        href={href}
        className={className}
        aria-current={active ? "page" : undefined}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {content}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-current={active ? "page" : undefined}>
      {content}
    </button>
  )
}

interface InfoRowProps {
  icon: LucideIcon
  title: string
  text: string
  href?: string
  // Texto completo (sem cortar em 2 linhas), ex.: horário de funcionamento.
  full?: boolean
  className?: string
}

// Cartão de informação (título pequeno + texto). Usado na home e nas folhas.
export function InfoRow({ icon, title, text, href, full, className }: InfoRowProps) {
  const base = cn(
    "flex min-h-14 min-w-0 items-center gap-3 rounded-2xl bg-surface p-3 text-on-dark shadow-sm",
    href && "transition-colors hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring",
    className
  )

  const content = (
    <>
      <TonalIcon icon={icon} />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="text-[11px] font-bold uppercase tracking-wider text-accent-title">{title}</span>
        <span className={cn("break-words text-sm font-medium text-on-dark", !full && "line-clamp-2")}>{text}</span>
      </span>
    </>
  )

  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={base}>
      {content}
    </a>
  ) : (
    <div className={base}>{content}</div>
  )
}
