import { getStoreBranding } from "@/lib/storeBranding"
import type { Tenant } from "@/types"

const GENERIC_ICONS = [
  { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
  { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
]

// Ícone de manifest não precisa de CORS pra ser exibido (carrega como <img>,
// não como fetch), mas ainda assim testamos se a URL da logo carrega de fato —
// se a logo estiver quebrada/indisponível, cai no ícone genérico em vez de
// deixar a instalação do PWA com um ícone quebrado.
function imageLoads(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = src
  })
}

export async function applyTenantManifest(tenant: Tenant, slug: string): Promise<() => void> {
  // Plano básico não usa a logo do lojista em lugar nenhum, nem no manifest —
  // sem essa checagem, o menu "Instalar app" nativo do navegador (fora do
  // nosso botão, ex: menu de 3 pontos do Chrome) ainda ofereceria a marca real.
  const { logoUrl } = getStoreBranding(tenant)
  const logoWorks = logoUrl ? await imageLoads(logoUrl) : false

  const manifest = {
    name: tenant.name,
    short_name: tenant.name.slice(0, 12), // nomes de app ficam melhor curtos
    start_url: `/${slug}`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0066FF",
    icons: logoWorks
      ? [
          { src: logoUrl!, sizes: "192x192", type: "image/png" },
          { src: logoUrl!, sizes: "512x512", type: "image/png" },
        ]
      : GENERIC_ICONS,
  }

  const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const link = document.getElementById("pwa-manifest") as HTMLLinkElement | null
  if (link) link.href = url

  return () => URL.revokeObjectURL(url)
}
