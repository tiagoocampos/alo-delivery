import { useEffect, useState } from "react"
import { Sparkles, X } from "lucide-react"
import { TonalIcon } from "@/components/shell/SheetParts"
import { cn } from "@/lib/utils"
import { useCustomerTour } from "@/tour/useCustomerTour"

const EXIT_MS = 400

// Convite do tutorial como cartão dentro da página (abaixo da abertura, antes
// do cardápio): não cobre nada e não rouba o foco. O tour só começa se o
// cliente tocar em "Ver como pedir". Ao sair, o cartão recolhe com suavidade.
export function CustomerTourInvite() {
  const { inviteVisible, startTour, dismissInvite } = useCustomerTour()

  // `mounted` segura o cartão na tela durante a animação de saída.
  const [mounted, setMounted] = useState(inviteVisible)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (inviteVisible) {
      setMounted(true)
      // Um quadro depois, para a altura animar de 0 até o tamanho real.
      const frame = window.requestAnimationFrame(() => setOpen(true))
      return () => window.cancelAnimationFrame(frame)
    }

    setOpen(false)
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const timer = window.setTimeout(() => setMounted(false), reduce ? 0 : EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [inviteVisible])

  if (!mounted) return null

  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-400 ease-out motion-reduce:transition-none",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-4 pt-4">
          <section
            aria-labelledby="customer-tour-invite-title"
            inert={!open}
            className="relative flex flex-col gap-2 rounded-3xl border-l-4 border-primary bg-surface p-3 pr-12 text-on-dark shadow-md shadow-black/10 ring-1 ring-white/10"
          >
            <button
              type="button"
              onClick={dismissInvite}
              aria-label="Fechar convite do tutorial"
              className="absolute right-0.5 top-0.5 flex size-11 items-center justify-center rounded-full text-on-dark-muted transition-colors hover:text-on-dark focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
            >
              <X className="size-4" aria-hidden />
            </button>

            <div className="flex items-start gap-3">
              <TonalIcon icon={Sparkles} />
              <div className="flex min-w-0 flex-col gap-0.5">
                <h2 id="customer-tour-invite-title" className="font-heading text-sm leading-tight text-accent-title">
                  Primeira vez pedindo por aqui?
                </h2>
                <p className="text-xs leading-snug text-on-dark-muted">
                  Veja em menos de 1 minuto como montar e enviar seu pedido.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={dismissInvite}
                className="min-h-11 rounded-full px-4 text-sm font-semibold text-on-dark transition-colors hover:bg-white/10"
              >
                Agora não
              </button>
              <button
                type="button"
                onClick={startTour}
                className="min-h-11 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-transform active:scale-95"
              >
                Ver como pedir
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
