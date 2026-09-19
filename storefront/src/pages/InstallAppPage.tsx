import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Download, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getInitials } from "@/lib/text"
import { getStoreBranding } from "@/lib/storeBranding"
import { applyTenantManifest } from "@/lib/pwaManifest"
import { useInstallPrompt } from "@/hooks/useInstallPrompt"
import { getTenant } from "@/services/storefront"
import type { Tenant } from "@/types"

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches
}

export function InstallAppPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { canInstall, promptInstall } = useInstallPrompt()

  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [alreadyInstalled] = useState(isStandalone)

  useEffect(() => {
    if (!slug) return

    let active = true
    setLoading(true)
    setNotFound(false)

    getTenant(slug)
      .then((data) => {
        if (active) setTenant(data)
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

  // Aplica o manifest da loja antes de qualquer clique em instalar — sem isso,
  // a instalação pode sair com o ícone/nome genérico do Alô Delivery.
  useEffect(() => {
    if (!tenant || !slug) return

    let cleanup: (() => void) | undefined
    let cancelled = false

    applyTenantManifest(tenant, slug).then((revoke) => {
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
  }, [tenant, slug])

  if (!slug) return null

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
        <Skeleton className="size-24 rounded-2xl" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-full max-w-xs" />
      </div>
    )
  }

  if (notFound || !tenant) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-2 p-6 text-center">
        <h1 className="font-heading text-lg font-semibold text-foreground">Loja não encontrada</h1>
        <p className="text-sm text-muted-foreground">Verifique o link ou entre em contato com a loja.</p>
      </div>
    )
  }

  if (tenant.effectivePlan === "basico") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">Instalação de app não disponível no momento.</p>
        <Button size="lg" onClick={() => navigate(`/${slug}`)}>
          Ir para o cardápio
        </Button>
      </div>
    )
  }

  const handleInstall = async () => {
    setInstalling(true)
    await promptInstall()
    setInstalling(false)
    navigate(`/${slug}`)
  }

  // Essa tela já retorna antes de chegar aqui quando o plano é básico (acima),
  // mas usamos o mesmo helper por consistência com StoreHeader/NavMenuSheet.
  const { logoUrl } = getStoreBranding(tenant)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      {logoUrl ? (
        <img src={logoUrl} alt="" className="size-24 rounded-2xl object-cover shadow-md" />
      ) : (
        <span className="flex size-24 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
          {getInitials(tenant.name)}
        </span>
      )}

      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-xl font-bold text-foreground">{tenant.name}</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Instale o app da {tenant.name} e peça mais rápido, direto da tela inicial do seu celular.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col items-center gap-3">
        {alreadyInstalled ? (
          <>
            <p className="text-sm font-medium text-foreground">Você já tem o app instalado! 🎉</p>
            <Button size="lg" className="w-full" onClick={() => navigate(`/${slug}`)}>
              Ir para o cardápio
            </Button>
          </>
        ) : canInstall ? (
          <Button size="lg" className="w-full" onClick={handleInstall} disabled={installing}>
            <Download />
            {installing ? "Instalando..." : "Instalar app"}
          </Button>
        ) : (
          <div className="rounded-xl border border-border bg-card p-4 text-left text-sm text-muted-foreground">
            {isIOS ? (
              <>
                Toque no ícone de compartilhar (<Share className="inline size-3.5 align-text-bottom" />) e escolha{" "}
                <strong className="text-foreground">"Adicionar à Tela de Início"</strong>.
              </>
            ) : (
              "Abra este link pelo Chrome no seu Android pra instalar o app."
            )}
          </div>
        )}

        <Link to={`/${slug}`} className="text-xs text-muted-foreground underline-offset-4 hover:underline">
          Prefiro só ver o cardápio
        </Link>
      </div>
    </div>
  )
}
