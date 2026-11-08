// Memórias leves do aparelho do cliente, por loja (localStorage). Tudo com
// try/catch: modo privado ou dados bloqueados nunca podem quebrar a tela.

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // sem armazenamento: o recurso só não lembra na próxima visita.
  }
}

const orderedKey = (slug: string) => `pediu:${slug}`
const installDismissedKey = (slug: string) => `instalar-dispensado:${slug}`
const INSTALL_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000
const favoritesKey = (slug: string) => `favoritos:${slug}`

// O cliente já fez pedido nesta loja neste aparelho? Usado para recolher a
// apresentação da loja em visitas seguintes.
export function hasOrderedBefore(slug: string): boolean {
  return read(orderedKey(slug)) === "1"
}

export function markOrdered(slug: string) {
  write(orderedKey(slug), "1")
}

export function readFavorites(slug: string): string[] {
  try {
    const parsed: unknown = JSON.parse(read(favoritesKey(slug)) ?? "[]")
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []
  } catch {
    return []
  }
}

export function writeFavorites(slug: string, ids: string[]) {
  write(favoritesKey(slug), JSON.stringify(ids))
}

// "Agora não" no convite de instalar o app: não volta a aparecer por 7 dias.
export function isInstallPromptDismissed(slug: string): boolean {
  const dismissedAt = Number(read(installDismissedKey(slug)))

  return Number.isFinite(dismissedAt) && dismissedAt > 0 && Date.now() - dismissedAt < INSTALL_SNOOZE_MS
}

export function dismissInstallPrompt(slug: string) {
  write(installDismissedKey(slug), String(Date.now()))
}

// Algum pedido já foi feito neste aparelho, em qualquer loja? (cliente recorrente)
export function hasOrderedAnywhere(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i)?.startsWith("pediu:")) return true
    }
  } catch {
    // sem armazenamento: assume que não.
  }
  return false
}

// Dica "entre na conta para guardar seus favoritos": aparece uma vez por loja.
// Sem armazenamento não dá para lembrar que já apareceu, então não mostra.
const favoritesHintKey = (slug: string) => `favoritos-dica:${slug}`

export function canShowFavoritesHint(slug: string): boolean {
  try {
    return localStorage.getItem(favoritesHintKey(slug)) !== "1"
  } catch {
    return false
  }
}

export function markFavoritesHintShown(slug: string) {
  write(favoritesHintKey(slug), "1")
}
