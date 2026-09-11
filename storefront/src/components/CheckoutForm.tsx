import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
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
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "pix_manual", label: "Pix" },
  { value: "na_entrega", label: "Na entrega" },
]

export function CheckoutForm({ onSubmit, isSubmitting, defaultValues }: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "na_entrega", ...defaultValues },
  })

  const paymentMethod = watch("paymentMethod")

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
        <Input id="customerPhone" {...register("customerPhone")} placeholder="(00) 00000-0000" />
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
          {PAYMENT_OPTIONS.map((option) => (
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
      </div>

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Confirmar pedido"}
      </Button>
    </form>
  )
}
