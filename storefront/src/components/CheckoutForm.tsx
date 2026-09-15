import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Copy } from "lucide-react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { formatPhoneInput } from "@/lib/phone"
import { formatCents } from "@/lib/money"
import type { PaymentMethod } from "@/types"

const checkoutSchema = z.object({
  customerName: z.string().min(1, "O nome é obrigatório"),
  customerPhone: z.string().min(8, "Telefone inválido"),
  address: z.string().min(1, "O endereço de entrega é obrigatório"),
  paymentMethod: z.enum(["pix_manual", "na_entrega"], {
    message: "Escolha uma forma de pagamento",
  }),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>

interface CheckoutFormProps {
  onSubmit: (values: CheckoutFormValues) => void
  isSubmitting: boolean
  defaultValues?: Partial<CheckoutFormValues>
  pixKey: string | null
  totalCents: number
}

const ALL_PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "pix_manual", label: "Pix" },
  { value: "na_entrega", label: "Na entrega" },
]

export function CheckoutForm({ onSubmit, isSubmitting, defaultValues, pixKey, totalCents }: CheckoutFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "na_entrega", ...defaultValues },
  })

  const paymentMethod = watch("paymentMethod")

  // Lojista ainda sem chave Pix cadastrada: não ofereça a opção, já que não
  // haveria nenhuma informação por trás dela pro cliente pagar.
  const paymentOptions = pixKey ? ALL_PAYMENT_OPTIONS : ALL_PAYMENT_OPTIONS.filter((o) => o.value !== "pix_manual")

  const handleCopyPixKey = async () => {
    if (!pixKey) return
    await navigator.clipboard.writeText(pixKey)
    toast.success("Chave copiada!")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="customerName">Nome</Label>
        <Input id="customerName" {...register("customerName")} placeholder="Seu nome" />
        {errors.customerName && (
          <span className="text-xs text-destructive">{errors.customerName.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="customerPhone">Telefone</Label>
        <Controller
          control={control}
          name="customerPhone"
          render={({ field }) => (
            <Input
              id="customerPhone"
              value={field.value ?? ""}
              onChange={(event) => field.onChange(formatPhoneInput(event.target.value))}
              onBlur={field.onBlur}
              placeholder="(00) 00000-0000"
            />
          )}
        />
        {errors.customerPhone && (
          <span className="text-xs text-destructive">{errors.customerPhone.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">Endereço de entrega</Label>
        <Textarea id="address" {...register("address")} placeholder="Rua, número, bairro, complemento" />
        {errors.address && <span className="text-xs text-destructive">{errors.address.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Forma de pagamento</Label>
        <div className="flex gap-2">
          {paymentOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setValue("paymentMethod", option.value, { shouldValidate: true })}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                paymentMethod === option.value
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border text-foreground hover:bg-muted"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors.paymentMethod && (
          <span className="text-xs text-destructive">{errors.paymentMethod.message}</span>
        )}

        {paymentMethod === "pix_manual" && pixKey && (
          <div className="mt-1 flex flex-col gap-2 rounded-lg border border-border bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <span className="flex-1 truncate rounded-md border border-border bg-background px-2 py-1.5 font-mono text-sm">
                {pixKey}
              </span>
              <Button type="button" variant="outline" size="icon" onClick={handleCopyPixKey} aria-label="Copiar chave">
                <Copy />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Copie a chave acima e realize o pagamento de {formatCents(totalCents)} via Pix. A loja vai confirmar o
              recebimento.
            </p>
          </div>
        )}
      </div>

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Confirmar pedido"}
      </Button>
    </form>
  )
}
