// Script de desenvolvimento (não entra no bundle): valida a extração de cores e
// o contraste da paleta gerada com logos sintéticas.
//   npx tsx scripts/storeTheme.check.ts            -> roda as verificações
//   npx tsx scripts/storeTheme.check.ts --css      -> imprime o CSS do tema padrão
import {
  buildDefaultTheme,
  buildTheme,
  contrastRatio,
  extractPalette,
  themeContrastPairs,
  themeToCss,
  type Palette,
} from "../src/lib/storeTheme"

if (process.argv.includes("--css")) {
  process.stdout.write(themeToCss(buildDefaultTheme()))
  process.exit(0)
}

const SIZE = 64
type Pixel = [number, number, number, number]

function makeImage(paint: (x: number, y: number) => Pixel): Uint8ClampedArray {
  const data = new Uint8ClampedArray(SIZE * SIZE * 4)
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const [r, g, b, a] = paint(x, y)
      const i = (y * SIZE + x) * 4
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
      data[i + 3] = a
    }
  }
  return data
}

const TRANSPARENT: Pixel = [0, 0, 0, 0]
const inCircle = (x: number, y: number, radius: number) =>
  (x - SIZE / 2) ** 2 + (y - SIZE / 2) ** 2 <= radius ** 2

const cases: { name: string; image: Uint8ClampedArray; expectNull?: boolean; expectHue?: [number, number] }[] = [
  {
    name: "vermelha + amarela",
    image: makeImage((x, y) =>
      inCircle(x, y, 30) ? (inCircle(x, y, 12) ? [250, 200, 20, 255] : [200, 20, 40, 255]) : TRANSPARENT
    ),
    expectHue: [340, 20],
  },
  {
    name: "preta + vermelha",
    image: makeImage((x) => (x < 40 ? [15, 15, 15, 255] : [210, 25, 35, 255])),
    expectHue: [340, 20],
  },
  {
    name: "azul",
    image: makeImage((x, y) => (inCircle(x, y, 28) ? [20, 90, 220, 255] : TRANSPARENT)),
    expectHue: [200, 240],
  },
  {
    name: "fundo branco com texto colorido",
    image: makeImage((x, y) => (y > 24 && y < 40 && x > 8 && x < 56 ? [230, 90, 20, 255] : [255, 255, 255, 255])),
    expectHue: [10, 40],
  },
  {
    name: "fundo transparente (vazio)",
    image: makeImage(() => TRANSPARENT),
    expectNull: true,
  },
  {
    name: "só tons de cinza",
    image: makeImage((x) => [Math.round((x / SIZE) * 255), Math.round((x / SIZE) * 255), Math.round((x / SIZE) * 255), 255]),
    expectNull: true,
  },
  {
    name: "amarelo-pastel muito claro",
    image: makeImage((x, y) => (inCircle(x, y, 28) ? [255, 243, 160, 255] : TRANSPARENT)),
  },
  {
    name: "verde-limão + roxo",
    image: makeImage((x) => (x < 32 ? [150, 220, 30, 255] : [110, 40, 170, 255])),
  },
  {
    name: "quase tudo branco com um ponto rosa",
    image: makeImage((x, y) => (x > 30 && x < 36 && y > 30 && y < 36 ? [240, 60, 150, 255] : [250, 250, 250, 255])),
  },
]

let failures = 0
const fail = (message: string) => {
  failures++
  console.error(`  ✗ ${message}`)
}

function checkTheme(label: string, palette: Palette | null) {
  const theme = palette ? buildTheme(palette) : buildDefaultTheme()
  const pairs = themeContrastPairs(theme)
  let worst = Infinity

  for (const pair of pairs) {
    const ratio = contrastRatio(pair.fg, pair.bg)
    worst = Math.min(worst, ratio / pair.min)
    if (ratio < pair.min) {
      fail(`${label} — ${pair.name}: ${ratio.toFixed(2)} < ${pair.min} (${pair.fg} sobre ${pair.bg})`)
    }
  }

  console.log(
    `  ${palette ? `primária ${palette.primary} · destaque ${palette.accent}` : "tema padrão do Alô"} · ` +
      `${pairs.length} pares, pior margem ${(worst * 100).toFixed(0)}% do mínimo · primary ${theme.light["--primary"]} (texto ${theme.light["--primary-foreground"]})`
  )
}

for (const testCase of cases) {
  console.log(`\n${testCase.name}`)
  const palette = extractPalette(testCase.image)

  if (testCase.expectNull && palette !== null) fail("esperava cair no tema padrão (null), mas extraiu cores")
  if (!testCase.expectNull && palette === null) fail("esperava extrair cores, mas veio null")

  if (palette && testCase.expectHue) {
    // matiz da primária dentro da faixa esperada (faixa pode atravessar 0°)
    const [lo, hi] = testCase.expectHue
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(palette.primary.slice(i, i + 2), 16)) as [number, number, number]
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    let h = 0
    if (d > 0) {
      if (max === r) h = (((g - b) / d) % 6) * 60
      else if (max === g) h = ((b - r) / d + 2) * 60
      else h = ((r - g) / d + 4) * 60
    }
    h = (h + 360) % 360
    const inside = lo <= hi ? h >= lo && h <= hi : h >= lo || h <= hi
    if (!inside) fail(`matiz da primária ${h.toFixed(0)}° fora de ${lo}°–${hi}°`)
  }

  checkTheme(testCase.name, palette)
}

console.log("\ntema padrão do Alô")
checkTheme("padrão", null)

if (failures > 0) {
  console.error(`\n${failures} falha(s)`)
  process.exit(1)
}
console.log("\nTudo certo: contraste mínimo respeitado em todas as paletas.")
