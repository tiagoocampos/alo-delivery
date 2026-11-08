export function NotFoundPage() {
  return (
    <div className="bg-dots flex min-h-svh flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="font-heading text-4xl text-accent-heading">Página não encontrada</h1>
      <p className="text-sm text-muted-foreground">
        Acesse o cardápio pelo link enviado pela loja.
      </p>
    </div>
  )
}
