import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import { useCustomerAuth } from "@/hooks/useCustomerAuth"
import { addFavorite, getFavoriteIds, mergeFavorites, removeFavorite } from "@/services/customer"
import { canShowFavoritesHint, markFavoritesHintShown, readFavorites, writeFavorites } from "@/lib/storeMemory"

export interface FavoritesContextValue {
  // Mais recentes primeiro.
  favoriteIds: ReadonlySet<string>
  orderedIds: readonly string[]
  isFavorite: (productId: string) => boolean
  // Chamada deste produto em andamento (o coração fica desabilitado).
  isPending: (productId: string) => boolean
  toggleFavorite: (productId: string) => void
  // Convidado acabou de favoritar pela 1ª vez: a página mostra a dica uma vez.
  guestHintPending: boolean
  acknowledgeGuestHint: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const FavoritesContext = createContext<FavoritesContextValue | null>(null)

interface FavoritesProviderProps {
  slug: string
  children: ReactNode
}

const LIMIT_MESSAGE = "Você chegou ao limite de 100 favoritos. Remova algum para guardar outro."
const FAILURE_MESSAGE = "Não foi possível atualizar seus favoritos. Tente novamente."

function failureMessage(error: unknown) {
  return isAxiosError(error) && error.response?.status === 422 ? LIMIT_MESSAGE : FAILURE_MESSAGE
}

// Fonte única dos favoritos. Logado: a lista da conta (servidor) vale em
// qualquer aparelho. Convidado: lista só neste aparelho (localStorage).
// Ao entrar, os favoritos do aparelho são mesclados na conta e a lista local
// é esvaziada (aparelho compartilhado não herda favoritos da conta ao sair).
export function FavoritesProvider({ slug, children }: FavoritesProviderProps) {
  const { isAuthenticated } = useCustomerAuth()
  const [localIds, setLocalIds] = useState<string[]>(() => readFavorites(slug))
  const [serverIds, setServerIds] = useState<string[]>([])
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set())
  const [guestHintPending, setGuestHintPending] = useState(false)
  const pendingRef = useRef(new Set<string>())
  const localRef = useRef(localIds)

  // Sincroniza com o servidor quando o cliente entra (ou já está logado ao abrir).
  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false
    const local = localRef.current

    const sync = local.length > 0 ? mergeFavorites(slug, local) : getFavoriteIds(slug)

    sync
      .then((ids) => {
        if (cancelled) return
        setServerIds(ids)
        if (local.length > 0) {
          localRef.current = []
          setLocalIds([])
          writeFavorites(slug, [])
        }
      })
      .catch(() => {
        // Falha ao carregar (rede, sessão vencida): mantém o que há, sem barulho.
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, slug])

  const setPendingFlag = useCallback((productId: string, on: boolean) => {
    if (on) pendingRef.current.add(productId)
    else pendingRef.current.delete(productId)
    setPending(new Set(pendingRef.current))
  }, [])

  const toggleFavorite = useCallback(
    (productId: string) => {
      if (pendingRef.current.has(productId)) return

      if (!isAuthenticated) {
        const current = localRef.current
        const adding = !current.includes(productId)
        const next = adding ? [productId, ...current] : current.filter((id) => id !== productId)

        localRef.current = next
        setLocalIds(next)
        writeFavorites(slug, next)

        if (adding && canShowFavoritesHint(slug)) {
          markFavoritesHintShown(slug)
          setGuestHintPending(true)
        }
        return
      }

      const adding = !serverIds.includes(productId)
      const revert = () =>
        setServerIds((current) => (adding ? current.filter((id) => id !== productId) : [productId, ...current]))

      // Otimista: o coração muda na hora; falhou, desfaz.
      setServerIds((current) => (adding ? [productId, ...current] : current.filter((id) => id !== productId)))
      setPendingFlag(productId, true)

      const request = adding ? addFavorite(slug, productId) : removeFavorite(slug, productId)

      request
        .then((ids) => {
          setPendingFlag(productId, false)
          // Só confia na lista do servidor quando nada mais está em andamento.
          if (pendingRef.current.size === 0) setServerIds(ids)
        })
        .catch((error: unknown) => {
          setPendingFlag(productId, false)
          revert()
          toast.error(failureMessage(error))
        })
    },
    [isAuthenticated, serverIds, slug, setPendingFlag]
  )

  const acknowledgeGuestHint = useCallback(() => setGuestHintPending(false), [])

  // Deslogado, a lista é a do aparelho; a do servidor só vale logado.
  const orderedIds = isAuthenticated ? serverIds : localIds

  const value = useMemo<FavoritesContextValue>(() => {
    const favoriteIds = new Set(orderedIds)
    return {
      favoriteIds,
      orderedIds,
      isFavorite: (productId) => favoriteIds.has(productId),
      isPending: (productId) => pending.has(productId),
      toggleFavorite,
      guestHintPending,
      acknowledgeGuestHint,
    }
  }, [orderedIds, pending, toggleFavorite, guestHintPending, acknowledgeGuestHint])

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}
