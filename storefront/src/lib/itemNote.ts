// A remoção de ingredientes viaja dentro do `note` do item do pedido:
//   linha 1 (se houver remoção):  "SEM: tomate, milho"
//   linha 2 (se o cliente digitou): o texto livre dele
// O backend aceita até 300 caracteres no total.

export const NOTE_MAX_LENGTH = 300

const REMOVED_PREFIX = "SEM: "

export function buildRemovedLine(removed: string[]): string {
  return removed.length > 0 ? `${REMOVED_PREFIX}${removed.join(", ")}` : ""
}

// Quantos caracteres sobram para a observação do cliente depois da linha
// "SEM:" (e da quebra de linha que separa as duas).
export function maxObservationLength(removed: string[]): number {
  if (removed.length === 0) return NOTE_MAX_LENGTH

  return Math.max(0, NOTE_MAX_LENGTH - buildRemovedLine(removed).length - 1)
}

// Monta o `note` enviado ao backend. Se não couber tudo, corta a observação do
// cliente — nunca a linha "SEM:", que a cozinha precisa ler.
export function buildItemNote(removed: string[] | undefined, observation: string | undefined): string | undefined {
  const removedList = removed ?? []
  const room = maxObservationLength(removedList)
  const text = (observation ?? "").trim().slice(0, room).trim()

  const parts = [buildRemovedLine(removedList), text].filter(Boolean)

  return parts.length > 0 ? parts.join("\n") : undefined
}

export interface ParsedItemNote {
  removed: string[]
  observation: string
}

// Lê o `note` que o backend devolve nos pedidos (o inverso de buildItemNote).
export function parseItemNote(note: string | null | undefined): ParsedItemNote {
  if (!note) return { removed: [], observation: "" }

  const [firstLine = "", ...rest] = note.split("\n")

  if (firstLine.startsWith(REMOVED_PREFIX)) {
    const removed = firstLine
      .slice(REMOVED_PREFIX.length)
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)

    return { removed, observation: rest.join("\n").trim() }
  }

  return { removed: [], observation: note.trim() }
}
