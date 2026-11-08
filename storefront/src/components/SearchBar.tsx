import { Search, X } from "lucide-react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = "Buscar no cardápio..." }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-on-dark-muted" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Buscar no cardápio"
        className="h-12 w-full rounded-full border border-white/10 bg-brand-dark pl-12 pr-11 text-base text-on-dark shadow-sm outline-none placeholder:text-on-dark-muted focus-visible:ring-3 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpar busca"
          className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-on-dark-muted hover:text-on-dark"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
