import { rgbToHex } from "@/lib/storeTheme"

// O que a abertura precisa saber do banner antes de desenhá-lo: proporção
// (para reservar o espaço sem deslocar o layout) e a cor das bordas de cima e
// de baixo (para o bloco ao redor ficar da mesma cor, sem emenda).
export interface BannerInfo {
  ratio: number | null
  // null = não foi possível ler (CORS, transparente): usa a cor da marca.
  top: string | null
  bottom: string | null
}

const SAMPLE_WIDTH = 96
const EDGE_ROWS = 2
const cacheKey = (url: string) => `banner:${url}`

export function readCachedBanner(url: string): BannerInfo | null {
  try {
    const raw = localStorage.getItem(cacheKey(url))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<BannerInfo>
    if (typeof parsed.ratio === "number" || parsed.ratio === null) {
      return { ratio: parsed.ratio ?? null, top: parsed.top ?? null, bottom: parsed.bottom ?? null }
    }
  } catch {
    // sem armazenamento ou valor corrompido: lê a imagem de novo.
  }
  return null
}

export function cacheBanner(url: string, info: BannerInfo) {
  try {
    localStorage.setItem(cacheKey(url), JSON.stringify(info))
  } catch {
    // sem cache, só recalcula na próxima visita.
  }
}

// Média das cores opacas de algumas linhas da borda. Devolve null se a borda for
// quase toda transparente (PNG com fundo vazio).
function averageRows(data: Uint8ClampedArray, width: number, rows: number[]): string | null {
  let r = 0, g = 0, b = 0, count = 0, total = 0

  for (const row of rows) {
    for (let x = 0; x < width; x++) {
      const i = (row * width + x) * 4
      total++
      if (data[i + 3]! < 200) continue
      r += data[i]!
      g += data[i + 1]!
      b += data[i + 2]!
      count++
    }
  }

  if (count === 0 || count / total < 0.5) return null
  return rgbToHex(Math.round(r / count), Math.round(g / count), Math.round(b / count))
}

function sampleEdges(image: HTMLImageElement, ratio: number): Pick<BannerInfo, "top" | "bottom"> {
  const width = SAMPLE_WIDTH
  const height = Math.max(EDGE_ROWS * 2, Math.round(width / ratio))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) return { top: null, bottom: null }

  context.drawImage(image, 0, 0, width, height)
  // Lança SecurityError se o servidor da imagem não liberar CORS.
  const { data } = context.getImageData(0, 0, width, height)

  const topRows = Array.from({ length: EDGE_ROWS }, (_, i) => i)
  const bottomRows = Array.from({ length: EDGE_ROWS }, (_, i) => height - 1 - i)

  return { top: averageRows(data, width, topRows), bottom: averageRows(data, width, bottomRows) }
}

function loadImage(url: string, cors: boolean): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image()
    if (cors) image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = url
  })
}

// Lê proporção e cores das bordas. Se o servidor não liberar CORS, tenta de novo
// sem leitura de pixels só para saber a proporção (as cores caem na da marca).
export async function loadBannerInfo(url: string): Promise<BannerInfo & { cacheable: boolean }> {
  const withCors = await loadImage(url, true)

  if (withCors && withCors.naturalWidth > 0 && withCors.naturalHeight > 0) {
    const ratio = withCors.naturalWidth / withCors.naturalHeight
    try {
      return { ratio, ...sampleEdges(withCors, ratio), cacheable: true }
    } catch {
      return { ratio, top: null, bottom: null, cacheable: true }
    }
  }

  const plain = await loadImage(url, false)
  if (plain && plain.naturalWidth > 0 && plain.naturalHeight > 0) {
    return { ratio: plain.naturalWidth / plain.naturalHeight, top: null, bottom: null, cacheable: true }
  }

  return { ratio: null, top: null, bottom: null, cacheable: false }
}
