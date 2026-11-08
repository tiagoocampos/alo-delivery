import { BookOpen } from "lucide-react"

// Título da seção do cardápio. É também o ponto de rolagem de "Ver cardápio".
export function MenuTitle() {
  return (
    <div id="cardapio" className="mx-auto flex w-full max-w-6xl flex-col items-start gap-1 px-4 pb-3 pt-8">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-dark px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-accent-title">
        <BookOpen className="size-3.5" aria-hidden />
        Cardápio
      </span>
      <h2 className="font-heading text-3xl text-accent-heading sm:text-4xl">Escolha o seu pedido</h2>
      <p className="font-script text-xl leading-tight text-muted-foreground">
        Bateu a fome? Chama a gente que a gente resolve
      </p>
    </div>
  )
}
