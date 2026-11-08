import { MessageCircle, Phone, ShoppingBag } from "lucide-react"
import { formatCents } from "@/lib/money"
import { telUrl, whatsappUrl } from "@/lib/contact"

interface BottomBarProps {
  phone: string | null
  count: number
  subtotal: number
  onOpenCart: () => void
}

const SIDE_ACTION =
  "flex min-h-12 min-w-12 shrink-0 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-bold transition-transform active:scale-95"

// Barra fixa inferior das telas do cardápio: ligar, WhatsApp e o pedido com o
// valor sempre à vista. Sem telefone, sobra só o botão do pedido.
export function BottomBar({ phone, count, subtotal, onOpenCart }: BottomBarProps) {
  const tel = telUrl(phone)
  const whatsapp = whatsappUrl(phone)

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-brand-dark pb-safe">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-2">
        {tel && (
          <a
            href={tel}
            aria-label="Ligar para a loja"
            className={`${SIDE_ACTION} border border-white/20 text-on-dark hover:bg-white/10`}
          >
            <Phone className="size-5" aria-hidden />
            <span className="hidden min-[420px]:inline">Ligar</span>
          </a>
        )}

        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            aria-label="Chamar a loja no WhatsApp"
            className={`${SIDE_ACTION} bg-whatsapp text-white`}
          >
            <MessageCircle className="size-5" aria-hidden />
            <span className="hidden min-[420px]:inline">WhatsApp</span>
          </a>
        )}

        <button
          type="button"
          onClick={onOpenCart}
          data-tour="barra-pedido"
          aria-label={`Abrir pedido, ${count} ${count === 1 ? "item" : "itens"}, ${formatCents(subtotal)}`}
          className="flex min-h-12 min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl bg-primary px-4 text-primary-foreground transition-transform active:scale-[0.98]"
        >
          <span className="flex items-center gap-2 text-base font-bold">
            <span className="relative">
              <ShoppingBag className="size-5" aria-hidden />
              {count > 0 && (
                <span
                  key={count}
                  className="absolute -right-2 -top-2 flex min-w-4 animate-in items-center justify-center rounded-full bg-primary-foreground px-1 text-[10px] font-extrabold leading-4 text-primary zoom-in-50 duration-200"
                >
                  {count}
                </span>
              )}
            </span>
            Pedido
          </span>
          <span className="text-base font-extrabold tabular-nums">{formatCents(subtotal)}</span>
        </button>
      </div>
    </div>
  )
}
