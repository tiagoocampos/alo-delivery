import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { getStoreBranding } from "@/lib/storeBranding"
import { dismissInstallPrompt, isInstallPromptDismissed } from "@/lib/storeMemory"
import { useInstallPrompt } from "@/hooks/useInstallPrompt"
import type { Tenant } from "@/types"

interface InstallAppCardProps {
  tenant: Tenant
  slug: string
}

const ENTER_DELAY_MS = 600
const EXIT_DURATION_MS = 500

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches
}

type Phase = "idle" | "in" | "out"

// Convite para instalar o app da loja (PWA), logo abaixo da abertura. Entra
// deslizando pela lateral e, ao tocar em "Agora não", sai deslizando de volta.
// Quem dispensa só volta a ver depois de alguns dias.
export function InstallAppCard({ tenant, slug }: InstallAppCardProps) {
  const { canInstall, promptInstall } = useInstallPrompt()
  const navigate = useNavigate()
  const { isBasico, logoUrl } = getStoreBranding(tenant)

  const [phase, setPhase] = useState<Phase>("idle")
  const [dismissed, setDismissed] = useState(() => isInstallPromptDismissed(slug))
  const [installed] = useState(isStandalone)

  // Chrome/Android/desktop avisam pelo evento (canInstall). No iPhone não existe
  // evento: a instalação é manual, e o botão leva ao passo a passo da loja.
  const eligible = !isBasico && !installed && !dismissed && (canInstall || isIOS)

  useEffect(() => {
    if (!eligible || phase !== "idle") return

    const timer = window.setTimeout(() => setPhase("in"), ENTER_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [eligible, phase])

  function slideOutThen(afterExit: () => void) {
    setPhase("out")
    window.setTimeout(afterExit, EXIT_DURATION_MS)
  }

  function handleLater() {
    slideOutThen(() => {
      dismissInstallPrompt(slug)
      setDismissed(true)
    })
  }

  async function handleInstall() {
    if (canInstall) {
      await promptInstall()
      // Aceitando ou não, o navegador não oferece o mesmo prompt de novo.
      slideOutThen(() => {
        dismissInstallPrompt(slug)
        setDismissed(true)
      })
      return
    }

    navigate(`/${slug}/instalar`)
  }

  if (isBasico || installed || dismissed) return null
  if (!eligible && phase !== "out") return null

  const visible = phase === "in"

  return (
    // A faixa externa corta o que passa da borda da tela, então o card desliza
    // sem criar rolagem horizontal; a altura abre junto, sem "pulo" no conteúdo.
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none",
        visible ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-4 py-4">
          <section
            aria-label="Instalar o aplicativo da loja"
            inert={!visible}
            className={cn(
              "flex flex-col gap-4 rounded-3xl bg-brand-dark p-4 text-on-dark shadow-lg shadow-black/15 ring-1 ring-white/10 transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none sm:flex-row sm:items-center sm:justify-between sm:p-5",
              visible ? "translate-x-0 opacity-100" : "translate-x-[110%] opacity-0"
            )}
          >
            <div className="flex min-w-0 items-center gap-3.5">
              {logoUrl ? (
                <img src={logoUrl} alt="" width={52} height={52} className="size-13 shrink-0 rounded-2xl object-cover ring-2 ring-white/15" />
              ) : (
                <span className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-accent-title">
                  <Download className="size-6" aria-hidden />
                </span>
              )}

              <div className="flex min-w-0 flex-col gap-0.5">
                <h2 className="font-heading line-clamp-2 break-words text-base text-accent-title">
                  Instale o app da {tenant.name}
                </h2>
                <p className="text-sm leading-snug text-on-dark-muted">
                  Peça mais rápido, direto da tela inicial do seu celular.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 gap-2.5">
              <button
                type="button"
                onClick={handleInstall}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground transition-transform active:scale-95 sm:flex-none"
              >
                <Download className="size-4" aria-hidden />
                Instalar
              </button>
              <button
                type="button"
                onClick={handleLater}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-white/25 px-5 text-sm font-semibold text-on-dark transition-colors hover:bg-white/10 sm:flex-none"
              >
                Agora não
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
