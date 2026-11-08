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
