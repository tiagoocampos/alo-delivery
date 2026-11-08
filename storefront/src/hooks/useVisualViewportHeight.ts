import { useEffect, useState } from "react"

// Altura visível da tela (descontando o teclado virtual). No iOS o teclado
// cobre a parte de baixo sem redimensionar o layout; com essa altura o rodapé
// fixo do modal continua visível acima do teclado.
export function useVisualViewportHeight(): number | null {
  const [height, setHeight] = useState<number | null>(() => window.visualViewport?.height ?? null)

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const update = () => setHeight(viewport.height)
    viewport.addEventListener("resize", update)
    update()

    return () => viewport.removeEventListener("resize", update)
  }, [])

  return height
}
