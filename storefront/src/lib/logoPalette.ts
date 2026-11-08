import { extractPalette, type Palette } from "@/lib/storeTheme"

// Resultado de olhar a logo. "none" = a logo carregou mas não tem cor útil
// (vale guardar no cache). "error" = falhou carregar/ler (CORS, rede): não
// guardamos, pra tentar de novo na próxima visita.
export type LogoPaletteResult =
  | { status: "ok"; palette: Palette }
  | { status: "none" }
  | { status: "error" }

const SAMPLE_SIZE = 64
const cacheKey = (logoUrl: string) => `tema:${logoUrl}`

export function readCachedPalette(logoUrl: string): LogoPaletteResult | null {
  try {
    const raw = localStorage.getItem(cacheKey(logoUrl))
    if (!raw) return null
    if (raw === "none") return { status: "none" }

    const parsed = JSON.parse(raw) as Partial<Palette>
    if (typeof parsed.primary === "string" && typeof parsed.accent === "string") {
      return { status: "ok", palette: { primary: parsed.primary, accent: parsed.accent } }
    }
  } catch {
    // localStorage indisponível ou valor corrompido: recalcula.
  }
  return null
}

export function cachePalette(logoUrl: string, result: LogoPaletteResult) {
  if (result.status === "error") return

  try {
    localStorage.setItem(
      cacheKey(logoUrl),
      result.status === "ok" ? JSON.stringify(result.palette) : "none"
    )
  } catch {
    // sem cache, só recalcula na próxima visita.
  }
}

export function extractLogoPalette(logoUrl: string): Promise<LogoPaletteResult> {
  return new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = "anonymous"

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = SAMPLE_SIZE
        canvas.height = SAMPLE_SIZE

        const context = canvas.getContext("2d", { willReadFrequently: true })
        if (!context) return resolve({ status: "error" })

        context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
        // Lança SecurityError se o servidor da logo não liberar CORS.
        const { data } = context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE)

        const palette = extractPalette(data)
        resolve(palette ? { status: "ok", palette } : { status: "none" })
      } catch {
        resolve({ status: "error" })
      }
    }

    image.onerror = () => resolve({ status: "error" })
    image.src = logoUrl
  })
}
