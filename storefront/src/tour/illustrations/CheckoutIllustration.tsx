// Maquete estática do fechamento do pedido — só para ilustrar o tutorial.
const FIELDS = ["Nome", "Telefone", "Endereço"]

export function CheckoutIllustration({ methods }: { methods: string[] }) {
  return (
    <div
      role="img"
      aria-label={`Exemplo: campos de nome, telefone e endereço e as formas de pagamento ${methods.join(" e ")}.`}
      className="pointer-events-none flex select-none flex-col gap-2 rounded-2xl bg-brand-dark p-3 text-on-dark"
    >
      <div aria-hidden className="flex flex-col gap-1.5">
        {FIELDS.map((field) => (
          <div key={field} className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-dark-muted">{field}</span>
            <div className="h-7 rounded-lg border border-white/15 bg-white/5" />
          </div>
        ))}
      </div>
      <div aria-hidden className="flex gap-1.5">
        {methods.map((method, i) => (
          <span
            key={method}
            className={
              i === 0
                ? "flex-1 rounded-lg border border-accent-title bg-white/10 px-2 py-1.5 text-center text-xs font-bold"
                : "flex-1 rounded-lg border border-white/15 px-2 py-1.5 text-center text-xs font-semibold text-on-dark-muted"
            }
          >
            {method}
          </span>
        ))}
      </div>
    </div>
  )
}
