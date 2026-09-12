import { Skeleton } from "@/components/ui/skeleton"

export function MenuSkeleton() {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex items-center justify-between bg-brand px-3 py-2.5">
        <Skeleton className="size-8 rounded-sm bg-brand-foreground/10" />
        <Skeleton className="h-4 w-32 bg-brand-foreground/10" />
        <Skeleton className="size-8 rounded-sm bg-brand-foreground/10" />
      </div>

      <div className="p-3">
        <Skeleton className="h-9 w-full rounded-sm" />
      </div>

      <div className="flex flex-col">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-none" />
        ))}
      </div>

      <div className="flex flex-col gap-3 p-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-sm" />
        ))}
      </div>
    </div>
  )
}
