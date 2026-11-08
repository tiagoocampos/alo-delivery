import { useEffect } from "react"
import { Sparkles, X } from "lucide-react"
import { useCustomerTour } from "@/tour/useCustomerTour"

// Convite discreto: nada escurece, nada trava, o foco fica onde estava e o tour
// só começa se o cliente tocar em "Iniciar tutorial".
export function CustomerTourInvite() {
  const { inviteVisible, startTour, dismissInvite } = useCustomerTour()

  useEffect(() => {
    if (!inviteVisible) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissInvite()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [inviteVisible, dismissInvite])

  if (!inviteVisible) return null

  return (
    <div
      role="dialog"
      aria-labelledby="customer-tour-invite-title"
      aria-describedby="customer-tour-invite-text"
      // Logo acima da barra fixa inferior (Ligar/WhatsApp/Pedido), sem cobri-la.
      className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[45] flex flex-col gap-3 rounded-3xl bg-brand-dark p-4 text-on-dark shadow-2xl ring-1 ring-white/10 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-6 motion-safe:duration-500 sm:inset-x-auto sm:right-6 sm:w-96"
    >
      <button
        type="button"
        onClick={dismissInvite}
        aria-label="Fechar convite do tutorial"
        className="absolute right-1.5 top-1.5 flex size-11 items-center justify-center rounded-full text-on-dark-muted hover:text-on-dark"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="size-5" aria-hidden />
        </span>
        <div className="flex flex-col gap-0.5">
          <h2 id="customer-tour-invite-title" className="font-heading text-lg text-accent-title">
            Primeira vez pedindo por aqui?
          </h2>
          <p id="customer-tour-invite-text" className="text-sm leading-snug text-on-dark-muted">
            Veja em menos de 1 minuto como montar e enviar seu pedido.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={startTour}
          className="min-h-11 flex-1 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground sm:flex-none"
        >
          Iniciar tutorial
        </button>
        <button
          type="button"
          onClick={dismissInvite}
          className="min-h-11 rounded-full px-4 text-sm font-semibold text-on-dark hover:bg-white/10"
        >
          Agora não
        </button>
      </div>
    </div>
  )
}
