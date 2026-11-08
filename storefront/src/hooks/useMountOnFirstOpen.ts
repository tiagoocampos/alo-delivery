import { useState } from "react"

// Telas que só aparecem ao toque (carrinho, menu, conta...) são carregadas sob
// demanda: ficam fora do JS inicial e só montam na primeira vez que abrem.
export function useMountOnFirstOpen(open: boolean): boolean {
  const [mounted, setMounted] = useState(open)

  if (open && !mounted) setMounted(true)

  return mounted
}
