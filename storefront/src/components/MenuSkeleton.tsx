import { Skeleton } from "@/components/ui/skeleton"

// Espelha o layout novo: cabeçalho escuro, apresentação, faixa de categorias e cartões.
export function MenuSkeleton() {
  return (
    <div className="flex min-h-svh flex-col bg-background" aria-busy="true" aria-label="Carregando cardápio">
      <div className="flex h-14 items-center gap-3 border-b border-white/10 bg-brand-dark px-3">
        <Skeleton className="size-9 rounded-full bg-white/10" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-4 w-36 bg-white/10" />
          <Skeleton className="h-3 w-28 bg-white/10" />
        </div>
        <Skeleton className="size-9 rounded-full bg-white/10" />
      </div>

      <div className="flex flex-col gap-3 bg-brand-dark px-4 pb-6 pt-7">
        <Skeleton className="h-10 w-3/4 bg-white/10" />
        <Skeleton className="h-10 w-1/2 bg-white/10" />
        <Skeleton className="mt-2 h-12 w-full rounded-2xl bg-white/10" />
        <Skeleton className="h-12 w-full rounded-2xl bg-white/10" />
      </div>

      <div className="flex gap-2 overflow-hidden px-4 py-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-24 shrink-0 rounded-full" />
        ))}
      </div>

      <div className="grid gap-3 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-44 w-full rounded-3xl" />
        ))}
      </div>
    </div>
  )
}
