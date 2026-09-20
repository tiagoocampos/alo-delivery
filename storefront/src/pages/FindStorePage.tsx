import { useEffect, useMemo, useState, type KeyboardEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { searchStores } from "@/services/storefront"
import type { StoreSearchResult } from "@/types"

const ALO_DELIVERY_LANDING_URL = import.meta.env.VITE_ALO_DELIVERY_LANDING_URL

// Classes compartilhadas entre o <input> real e a camada "fantasma" atrás
// dele — precisam ser idênticas (fonte, tamanho, padding) pra o texto sugerido
// ficar alinhado, caractere por caractere, com o que o usuário já digitou.
const FIELD_TEXT_CLASS = "py-3.5 pl-12 pr-4 text-base sm:text-lg"

export function FindStorePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<StoreSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const debouncedQuery = useDebouncedValue(query, 280)

  useEffect(() => {
    const term = debouncedQuery.trim()

    if (!term) {
      setResults([])
      setSearched(false)
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)

    searchStores(term)
      .then((data) => {
        if (!active) return
        setResults(data)
        setSearched(true)
      })
      .catch(() => {
        if (!active) return
        setResults([])
        setSearched(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [debouncedQuery])

  // A sugestão "fantasma" só existe quando o melhor resultado realmente
  // começa com o que já foi digitado — não faz sentido completar inline a
  // partir de um resultado que só contém o termo em outro lugar do nome.
  const ghostSuffix = useMemo(() => {
    if (!query || results.length === 0) return ""

    const top = results[0]
    if (!top.name.toLowerCase().startsWith(query.toLowerCase())) return ""

    return top.name.slice(query.length)
  }, [query, results])

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && results.length > 0) {
      navigate(`/${results[0].slug}`)
      return
    }

    if (!ghostSuffix) return
    if (event.key !== "Tab" && event.key !== "ArrowRight") return

    const input = event.currentTarget
    const atEnd = input.selectionStart === query.length && input.selectionEnd === query.length
    if (event.key === "ArrowRight" && !atEnd) return

    event.preventDefault()
    setQuery(query + ghostSuffix)
  }

  const showDropdown = query.trim().length > 0

  return (
    <div className="flex min-h-svh flex-col items-center bg-brand px-4 py-12 text-brand-foreground sm:py-20">
      <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
        <img src="/brand/symbol.png" alt="" className="size-20 sm:size-24" />
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">Alô Delivery</h1>
        <p className="max-w-xs text-sm text-brand-foreground/70 sm:max-w-sm sm:text-base">
          Encontre sua loja favorita no Alô Delivery
        </p>
      </div>

      <div className="relative mt-8 w-full max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-brand-foreground/40" />

          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre rounded-full ${FIELD_TEXT_CLASS}`}
          >
            <span className="invisible">{query}</span>
            <span className="text-brand-foreground/35">{ghostSuffix}</span>
          </div>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite o nome da loja que você procura"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Buscar loja pelo nome"
            className={`relative w-full rounded-full border border-brand-foreground/20 bg-brand-foreground/5 text-brand-foreground caret-brand-foreground outline-none placeholder:text-brand-foreground/40 focus:border-brand-foreground/40 ${FIELD_TEXT_CLASS}`}
          />
        </div>

        {showDropdown && (
          <div className="absolute inset-x-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-lg">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Buscando...</div>
            ) : results.length > 0 ? (
              <ul>
                {results.map((store) => (
                  <li key={store.slug}>
                    <Link
                      to={`/${store.slug}`}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <Search className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{store.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              searched && (
                <div className="flex flex-col items-center gap-2 p-5 text-center">
                  <p className="text-sm text-muted-foreground">Nenhuma loja encontrada com esse nome</p>
                  <a
                    href={ALO_DELIVERY_LANDING_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Sua loja ainda não está no Alô Delivery? Conheça a plataforma →
                  </a>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
