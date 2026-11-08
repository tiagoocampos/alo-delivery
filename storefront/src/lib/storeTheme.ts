// Tema por loja derivado da logo. Tudo aqui é puro (sem DOM, sem rede) para ser
// testável fora do navegador: extração de cores a partir de pixels, geração da
// paleta clara/escura e garantia de contraste WCAG.

export interface HSL {
  h: number // 0–360
  s: number // 0–1
  l: number // 0–1
}

export interface Palette {
  primary: string // hex
  accent: string // hex
}

export type ThemeVars = Record<string, string>

export interface StoreTheme {
  light: ThemeVars
  dark: ThemeVars
  brandDark: string
}

/* -------------------------------------------------------------------------- */
/* Cores                                                                      */
/* -------------------------------------------------------------------------- */

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "")
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean
  const value = parseInt(full, 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

export function rgbToHex(r: number, g: number, b: number): string {
  const part = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, "0")
  return `#${part(r)}${part(g)}${part(b)}`
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const d = max - min

  if (d === 0) return { h: 0, s: 0, l }

  const s = d / (1 - Math.abs(2 * l - 1))
  let h: number
  if (max === rn) h = ((gn - bn) / d) % 6
  else if (max === gn) h = (bn - rn) / d + 2
  else h = (rn - gn) / d + 4

  return { h: (h * 60 + 360) % 360, s, l }
}

export function hslToHex({ h, s, l }: HSL): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = (((h % 360) + 360) % 360) / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  const m = l - c / 2

  let rgb: [number, number, number]
  if (hp < 1) rgb = [c, x, 0]
  else if (hp < 2) rgb = [x, c, 0]
  else if (hp < 3) rgb = [0, c, x]
  else if (hp < 4) rgb = [0, x, c]
  else if (hp < 5) rgb = [x, 0, c]
  else rgb = [c, 0, x]

  return rgbToHex((rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255)
}

export function hexToHsl(hex: string): HSL {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHsl(r, g, b)
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const v = channel / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

// Move a luminosidade de `color` (afastando-se dos fundos) até que o contraste
// com TODOS os fundos informados seja >= min. Se não for possível (ex.: fundo
// cinza médio), devolve o melhor extremo alcançável.
export function ensureContrast(color: string, against: string | string[], min: number): string {
  const backgrounds = Array.isArray(against) ? against : [against]
  const worst = (hex: string) => Math.min(...backgrounds.map((bg) => contrastRatio(hex, bg)))

  if (worst(color) >= min) return color

  const averageLuminance =
    backgrounds.reduce((sum, bg) => sum + relativeLuminance(bg), 0) / backgrounds.length
  const direction = averageLuminance > 0.4 ? -1 : 1 // fundo claro: escurece; escuro: clareia

  const base = hexToHsl(color)
  let best = color
  let bestScore = worst(color)

  for (let step = 1; step <= 100; step++) {
    const l = clamp(base.l + direction * step * 0.01, 0, 1)
    const candidate = hslToHex({ ...base, l })
    const score = worst(candidate)

    if (score > bestScore) {
      best = candidate
      bestScore = score
    }
    if (score >= min) return candidate
    if (l === 0 || l === 1) break
  }

  return best
}

function pickForeground(background: string): string {
  return contrastRatio(background, WHITE) >= contrastRatio(background, INK) ? WHITE : INK
}

/* -------------------------------------------------------------------------- */
/* Extração a partir de pixels                                                */
/* -------------------------------------------------------------------------- */

const BUCKETS = 12
const BUCKET_SIZE = 360 / BUCKETS

const hueDistance = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360
  return Math.min(d, 360 - d)
}

interface Bucket {
  count: number
  r: number
  g: number
  b: number
  satSum: number
}

// `data` é o RGBA do canvas reduzido (ImageData.data). Devolve null quando a
// logo não tem cor útil (monocromática, só cinza, transparente...).
export function extractPalette(data: ArrayLike<number>): Palette | null {
  const buckets: Bucket[] = Array.from({ length: BUCKETS }, () => ({ count: 0, r: 0, g: 0, b: 0, satSum: 0 }))
  let candidates = 0 // opacos que não são fundo (nem quase branco, nem quase preto)
  let usable = 0

  for (let i = 0; i + 3 < data.length; i += 4) {
    const alpha = data[i + 3]!
    if (alpha < 128) continue
    const r = data[i]!
    const g = data[i + 1]!
    const b = data[i + 2]!
    const { h, s, l } = rgbToHsl(r, g, b)

    if (l > 0.92 || l < 0.1) continue
    candidates++
    if (s < 0.25) continue
    usable++

    // Faixas centradas em 0°, 30°, 60°... para o vermelho não ser partido ao meio.
    const index = Math.floor((((h + BUCKET_SIZE / 2) % 360) / BUCKET_SIZE)) % BUCKETS
    const bucket = buckets[index]!
    bucket.count++
    bucket.r += r
    bucket.g += g
    bucket.b += b
    bucket.satSum += s
  }

  // Pouca cor útil (menos de 5% do que não é fundo) = logo praticamente sem cor
  // (ex.: só tons de cinza).
  if (usable < 12 || usable / candidates < 0.05) return null

  const scored = buckets
    .map((bucket) => {
      if (bucket.count === 0) return null
      const mean = rgbToHsl(bucket.r / bucket.count, bucket.g / bucket.count, bucket.b / bucket.count)
      // quantidade × saturação média = soma das saturações do cesto
      return { mean, score: bucket.satSum, hex: rgbToHex(bucket.r / bucket.count, bucket.g / bucket.count, bucket.b / bucket.count) }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => b.score - a.score)

  const primary = scored[0]
  if (!primary) return null

  const accent = scored.find(
    (entry) => entry !== primary && hueDistance(entry.mean.h, primary.mean.h) >= 30 && entry.score >= primary.score * 0.2
  )

  return {
    primary: primary.hex,
    accent: accent ? accent.hex : deriveAccent(primary.mean),
  }
}

// Sem segunda cor na logo: versão mais clara e mais quente da primária.
function deriveAccent(primary: HSL): string {
  const warmTarget = 40
  let delta = warmTarget - primary.h
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  const h = primary.h + clamp(delta, -25, 25)

  return hslToHex({ h: (h + 360) % 360, s: clamp(primary.s, 0.65, 1), l: clamp(primary.l + 0.2, 0.62, 0.75) })
}

/* -------------------------------------------------------------------------- */
/* Geração da paleta                                                          */
/* -------------------------------------------------------------------------- */

export const WHITE = "#ffffff"
export const INK = "#111418"

// Cores que nunca derivam da logo.
export const FIXED_COLORS = {
  whatsapp: "#157a3c", // verde do WhatsApp, escurecido p/ texto branco >= 4,5:1
  open: "#34d399",
  closed: "#fbbf24",
}

export const DEFAULT_PALETTE: Palette = { primary: "#1769e0", accent: "#8ab8ff" }
export const DEFAULT_FIXED = { brandDark: "#0c1422", surface: "#121a2c", paper: "#f3f6fc" }

interface BuildOptions {
  brandDark?: string
  surface?: string
  paper?: string
}

// Cor do botão principal: precisa de texto legível (>= 4,5:1) e continuar
// visível sobre o fundo escuro da barra fixa (>= 3:1). Varre a luminosidade e
// escolhe a mais próxima da cor original que cumpre as duas regras.
function solvePrimary(base: HSL, brandDark: string): { bg: string; fg: string } {
  const start = { h: base.h, s: clamp(base.s, 0.5, 0.95), l: clamp(base.l, 0.3, 0.6) }
  let best: { bg: string; fg: string; distance: number } | null = null

  for (let step = 0; step <= 100; step++) {
    const l = step / 100
    const bg = hslToHex({ ...start, l })
    if (contrastRatio(bg, brandDark) < 3) continue

    const fg = pickForeground(bg)
    if (contrastRatio(bg, fg) < 4.5) continue

    const distance = Math.abs(l - start.l)
    if (!best || distance < best.distance) best = { bg, fg, distance }
  }

  // Sempre existe solução com texto escuro; este ramo é só defensivo.
  return best ?? { bg: ensureContrast(hslToHex(start), INK, 4.5), fg: INK }
}

export function buildTheme(palette: Palette, options: BuildOptions = {}): StoreTheme {
  const p = hexToHsl(palette.primary)
  const a = hexToHsl(palette.accent)
  const hue = p.h
  const darkSat = clamp(p.s * 0.5, 0.3, 0.45)

  const brandDark = options.brandDark ?? hslToHex({ h: hue, s: darkSat, l: 0.09 })
  const surface = options.surface ?? hslToHex({ h: hue, s: darkSat, l: 0.14 })
  const paper = options.paper ?? hslToHex({ h: hue, s: clamp(p.s, 0.35, 0.45), l: 0.96 })
  const card = hslToHex({ h: hue, s: 0.3, l: 0.995 })

  const button = solvePrimary(p, brandDark)

  const accentTitle = ensureContrast(
    hslToHex({ h: a.h, s: clamp(a.s, 0.6, 1), l: clamp(a.l, 0.62, 0.78) }),
    [brandDark, surface],
    4.5
  )
  const accentInk = ensureContrast(
    hslToHex({ h: a.h, s: clamp(a.s, 0.5, 0.9), l: Math.min(a.l, 0.45) }),
    [paper, card],
    4.5
  )

  const onDark = hslToHex({ h: hue, s: 0.2, l: 0.95 })
  const onDarkMuted = ensureContrast(hslToHex({ h: hue, s: 0.12, l: 0.72 }), [surface, brandDark], 4.5)

  const [pr, pg, pb] = hexToRgb(button.bg)
  const ring = `rgba(${pr}, ${pg}, ${pb}, 0.5)`

  const lightMuted = hslToHex({ h: hue, s: 0.3, l: 0.93 })
  const lightAccent = hslToHex({ h: hue, s: 0.55, l: 0.92 })
  const lightForeground = hslToHex({ h: hue, s: 0.25, l: 0.1 })

  const shared: ThemeVars = {
    "--brand": brandDark,
    "--brand-foreground": WHITE,
    "--brand-dark": brandDark,
    "--surface": surface,
    "--paper": paper,
    "--on-dark": onDark,
    "--on-dark-muted": onDarkMuted,
    "--accent-title": accentTitle,
    "--primary": button.bg,
    "--primary-foreground": button.fg,
    "--ring": ring,
    "--whatsapp": FIXED_COLORS.whatsapp,
    "--status-open": FIXED_COLORS.open,
    "--status-closed": FIXED_COLORS.closed,
  }

  const light: ThemeVars = {
    ...shared,
    "--background": paper,
    "--foreground": lightForeground,
    "--card": card,
    "--card-foreground": lightForeground,
    "--popover": card,
    "--popover-foreground": lightForeground,
    "--secondary": hslToHex({ h: hue, s: 0.3, l: 0.94 }),
    "--secondary-foreground": lightForeground,
    "--muted": lightMuted,
    "--muted-foreground": ensureContrast(hslToHex({ h: hue, s: 0.12, l: 0.4 }), [paper, card, lightMuted], 4.5),
    "--accent": lightAccent,
    "--accent-foreground": ensureContrast(hslToHex({ h: p.h, s: clamp(p.s, 0.6, 0.9), l: 0.3 }), [lightAccent], 4.5),
    "--accent-heading": accentInk,
    "--border": hslToHex({ h: hue, s: 0.2, l: 0.87 }),
    "--input": hslToHex({ h: hue, s: 0.2, l: 0.87 }),
  }

  const darkAccent = hslToHex({ h: hue, s: 0.35, l: 0.18 })
  const darkMuted = hslToHex({ h: hue, s: darkSat, l: 0.17 })

  const dark: ThemeVars = {
    ...shared,
    "--paper": brandDark,
    "--background": brandDark,
    "--foreground": onDark,
    "--card": surface,
    "--card-foreground": onDark,
    "--popover": surface,
    "--popover-foreground": onDark,
    "--secondary": hslToHex({ h: hue, s: darkSat, l: 0.18 }),
    "--secondary-foreground": onDark,
    "--muted": darkMuted,
    "--muted-foreground": ensureContrast(hslToHex({ h: hue, s: 0.12, l: 0.7 }), [brandDark, surface, darkMuted], 4.5),
    "--accent": darkAccent,
    "--accent-foreground": ensureContrast(accentTitle, [darkAccent], 4.5),
    "--accent-heading": accentTitle,
    "--border": "rgba(255, 255, 255, 0.1)",
    "--input": "rgba(255, 255, 255, 0.15)",
  }

  return { light, dark, brandDark }
}

export function buildDefaultTheme(): StoreTheme {
  return buildTheme(DEFAULT_PALETTE, DEFAULT_FIXED)
}

function blockToCss(selector: string, vars: ThemeVars): string {
  const body = Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n")
  return `${selector} {\n${body}\n}`
}

export function themeToCss(theme: StoreTheme): string {
  return `${blockToCss(":root", theme.light)}\n${blockToCss(".dark", theme.dark)}\n`
}

/* -------------------------------------------------------------------------- */
/* Validação (usada pelo script de desenvolvimento)                           */
/* -------------------------------------------------------------------------- */

export interface ContrastPair {
  name: string
  fg: string
  bg: string
  min: number
}

// Toda combinação texto/fundo (ou componente/fundo) que a interface usa.
export function themeContrastPairs(theme: StoreTheme): ContrastPair[] {
  const pairs: ContrastPair[] = []

  for (const [mode, v] of [
    ["claro", theme.light],
    ["escuro", theme.dark],
  ] as const) {
    const add = (name: string, fg: string, bg: string, min = 4.5) =>
      pairs.push({ name: `${mode}: ${name}`, fg: v[fg]!, bg: v[bg]!, min })

    add("texto/fundo", "--foreground", "--background")
    add("texto/cartão", "--card-foreground", "--card")
    add("texto secundário/fundo", "--muted-foreground", "--background")
    add("texto secundário/cartão", "--muted-foreground", "--card")
    add("texto secundário/muted", "--muted-foreground", "--muted")
    add("botão: texto/primária", "--primary-foreground", "--primary")
    add("botão visível na barra escura", "--primary", "--brand-dark", 3)
    add("destaque: texto/accent", "--accent-foreground", "--accent")
    add("título de destaque/fundo", "--accent-heading", "--background")
    add("título de destaque/cartão", "--accent-heading", "--card")
    add("título sobre escuro/brand-dark", "--accent-title", "--brand-dark")
    add("título sobre escuro/surface", "--accent-title", "--surface")
    add("texto sobre escuro/brand-dark", "--on-dark", "--brand-dark")
    add("texto sobre escuro/surface", "--on-dark", "--surface")
    add("texto secundário sobre escuro/brand-dark", "--on-dark-muted", "--brand-dark")
    add("texto secundário sobre escuro/surface", "--on-dark-muted", "--surface")
    add("brand-foreground/brand", "--brand-foreground", "--brand")
  }

  pairs.push({
    name: "WhatsApp: texto branco/verde",
    fg: WHITE,
    bg: FIXED_COLORS.whatsapp,
    min: 4.5,
  })

  return pairs
}
