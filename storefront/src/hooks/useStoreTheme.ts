import { useEffect, useLayoutEffect, useState } from "react"
import { getStoreBranding } from "@/lib/storeBranding"
import {
  cachePalette,
  extractLogoPalette,
  readCachedPalette,
  type LogoPaletteResult,
} from "@/lib/logoPalette"
import { buildDefaultTheme, buildTheme, themeToCss, type StoreTheme } from "@/lib/storeTheme"
import type { Tenant } from "@/types"

const STYLE_ID = "tenant-theme"
const EXTRACTION_TIMEOUT_MS = 800

const DEFAULT_THEME = buildDefaultTheme()

function applyTheme(theme: StoreTheme | null) {
  let style = document.getElementById(STYLE_ID)

  // Tema padrão do Alô já vem estático no index.css: basta remover o da loja.
  if (!theme) {
    style?.remove()
    return
  }

  if (!style) {
    style = document.createElement("style")
    style.id = STYLE_ID
    document.head.appendChild(style)
  }
  style.textContent = themeToCss(theme)
}

function setThemeColorMeta(color: string) {
  const meta = document.querySelector<HTMLMetaElement>("meta[name='theme-color']")
  if (meta) meta.content = color
}

function themeFromResult(result: LogoPaletteResult): StoreTheme | null {
  return result.status === "ok" ? buildTheme(result.palette) : null
}

interface StoreThemeState {
  // false enquanto o tema da loja ainda está sendo calculado (primeira visita).
  ready: boolean
  // brand-dark do tema vigente — usado no theme_color do manifest.
  themeColor: string
}

// Aplica o tema da loja derivado da logo. Plano básico (sem logo), logo sem cor
// útil ou falha na leitura = tema padrão do Alô. Visitas seguintes usam o
// resultado guardado na hora, sem recalcular nem piscar.
export function useStoreTheme(tenant: Tenant | null): StoreThemeState {
  const logoUrl = tenant ? getStoreBranding(tenant).logoUrl : null
  const hasTenant = tenant !== null

  const [state, setState] = useState<StoreThemeState>({ ready: false, themeColor: DEFAULT_THEME.brandDark })

  // Ao sair da loja, devolve o tema padrão do Alô (ex.: ir para a busca de lojas).
  useEffect(
    () => () => {
      applyTheme(null)
      setThemeColorMeta(DEFAULT_THEME.brandDark)
    },
    []
  )

  useLayoutEffect(() => {
    if (!hasTenant) return

    let active = true

    const finish = (theme: StoreTheme | null) => {
      if (!active) return
      applyTheme(theme)
      const themeColor = (theme ?? DEFAULT_THEME).brandDark
      setThemeColorMeta(themeColor)
      setState({ ready: true, themeColor })
    }

    if (!logoUrl) {
      finish(null)
      return () => {
        active = false
      }
    }

    const cached = readCachedPalette(logoUrl)
    if (cached) {
      finish(themeFromResult(cached))
      return () => {
        active = false
      }
    }

    // Primeira visita: espera a extração (no máximo ~800 ms) antes de mostrar o
    // conteúdo, para a cor certa já aparecer. Se estourar o tempo, segue com o
    // padrão e só guarda o resultado para a próxima visita (sem trocar cores
    // no meio da tela).
    const extraction = extractLogoPalette(logoUrl).then((result) => {
      cachePalette(logoUrl, result)
      return result
    })

    let timedOut = false
    const timer = window.setTimeout(() => {
      timedOut = true
      finish(null)
    }, EXTRACTION_TIMEOUT_MS)

    extraction.then((result) => {
      window.clearTimeout(timer)
      if (!timedOut) finish(themeFromResult(result))
    })

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [hasTenant, logoUrl])

  return state
}
