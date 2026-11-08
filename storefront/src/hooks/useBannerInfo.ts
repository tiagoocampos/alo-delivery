import { useEffect, useState } from "react"
import { cacheBanner, loadBannerInfo, readCachedBanner, type BannerInfo } from "@/lib/bannerInfo"

const TIMEOUT_MS = 1500
const EMPTY: BannerInfo = { ratio: null, top: null, bottom: null }

// Proporção e cores de borda do banner. `ready` fica verdadeiro quando já dá
// para desenhar a abertura sem deslocar o layout: sem banner, com cache, ou
// depois de ler a imagem (no máximo TIMEOUT_MS; passou disso usa o padrão).
export function useBannerInfo(url: string | null): BannerInfo & { ready: boolean } {
  const [state, setState] = useState<{ url: string | null; info: BannerInfo; ready: boolean }>(() => {
    if (!url) return { url, info: EMPTY, ready: true }
    const cached = readCachedBanner(url)
    return { url, info: cached ?? EMPTY, ready: cached !== null }
  })

  useEffect(() => {
    if (!url || state.url === url && state.ready) return

    let cancelled = false
    const timer = window.setTimeout(() => {
      if (!cancelled) setState((current) => ({ ...current, url, ready: true }))
    }, TIMEOUT_MS)

    loadBannerInfo(url).then(({ cacheable, ...info }) => {
      if (cancelled) return
      window.clearTimeout(timer)
      if (cacheable) cacheBanner(url, info)
      setState({ url, info, ready: true })
    })

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
    // Só reage à troca de URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  // URL mudou e ainda não leu: trata como "carregando" em vez de usar dados velhos.
  if (state.url !== url) return { ...EMPTY, ready: !url }

  return { ...state.info, ready: state.ready }
}
