import type { ReactNode } from "react"
import { X } from "lucide-react"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface SheetShellProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  side?: "left" | "right" | "bottom"
  // Substitui o título simples por um cabeçalho próprio (ex.: identidade da loja).
  // Quem passa `header` deve incluir um SheetTitle nele (o título acessível da folha).
  header?: ReactNode
  footer?: ReactNode
  footerClassName?: string
  className?: string
  bodyClassName?: string
  children: ReactNode
}

// Moldura única das folhas da loja: faixa de cabeçalho igual à do topo da home
// (fundo da marca, título em fonte de título na cor de destaque, fechar de 44 px),
// corpo rolável e rodapé opcional que respeita a área segura inferior.
export function SheetShell({
  open,
  onOpenChange,
  title,
  description,
  side = "right",
  header,
  footer,
  footerClassName,
  className,
  bodyClassName,
  children,
}: SheetShellProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        showCloseButton={false}
        className={cn(
          // No celular a folha ocupa a tela (o padrão do shadcn deixava 3/4).
          "gap-0 overflow-hidden p-0 data-[side=left]:w-[88vw] data-[side=right]:w-full data-[side=bottom]:w-full sm:max-w-md",
          side === "bottom" && "max-h-[92dvh] rounded-t-3xl",
          className
        )}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-brand-dark py-2 pl-4 pr-2 text-on-dark">
          <div className="min-w-0 flex-1">
            {header ?? (
              <SheetTitle className="font-heading text-xl text-accent-title [--heading-weight:700]">{title}</SheetTitle>
            )}
            {description && (
              <SheetDescription className="text-xs leading-snug text-on-dark-muted">{description}</SheetDescription>
            )}
          </div>

          <SheetClose
            aria-label="Fechar"
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-on-dark-muted transition-colors hover:bg-white/10 hover:text-on-dark focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
          >
            <X className="size-5" aria-hidden />
          </SheetClose>
        </div>

        <div className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto pt-4", !footer && "pb-safe", bodyClassName)}>
          {children}
        </div>

        {footer && (
          <div className={cn("shrink-0 border-t border-border bg-popover px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]", footerClassName)}>
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
