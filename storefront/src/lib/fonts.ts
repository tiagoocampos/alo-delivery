// As fontes do tema (títulos, texto, manuscrito) só começariam a baixar depois
// que o cardápio renderizasse, e a troca da fonte reserva faria o conteúdo
// "pular". Pedimos as fontes já no início (durante o skeleton) e a página só
// aparece quando estiverem prontas — com um limite de tempo para nunca travar.
const FACES = [
  '700 1em "Outfit Variable"',
  '800 1em "Outfit Variable"',
  '400 1em "Inter Variable"',
  '500 1em "Inter Variable"',
  '700 1em "Inter Variable"',
  '800 1em "Inter Variable"',
  '400 1em "Patrick Hand"',
]
const SAMPLE_TEXT = "Aa Çã Éé Õõ 0123456789 R$ ,.-"
const TIMEOUT_MS = 1500

let loading: Promise<void> | null = null

export function loadFonts(): Promise<void> {
  if (!loading) {
    const fontsLoaded = Promise.all(FACES.map((face) => document.fonts.load(face, SAMPLE_TEXT)))
      .then(() => undefined)
      .catch(() => undefined)
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, TIMEOUT_MS))

    loading = Promise.race([fontsLoaded, timeout])
  }

  return loading
}
