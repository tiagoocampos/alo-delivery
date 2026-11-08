// Estado do tutorial do cliente: um valor só por aparelho (vale para qualquer
// loja). Tudo com try/catch.

export type TutorialState = "dismissed" | "completed"

const KEY = "tutorial-cliente"

// "unavailable" = o armazenamento falhou: não dá para lembrar a escolha do
// cliente, então o convite não aparece (melhor não irritar do que repetir).
export function readTutorialState(): TutorialState | "unavailable" | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw === "dismissed" || raw === "completed" ? raw : null
  } catch {
    return "unavailable"
  }
}

export function writeTutorialState(state: TutorialState) {
  try {
    localStorage.setItem(KEY, state)
  } catch {
    // sem armazenamento: o convite simplesmente não é lembrado.
  }
}
