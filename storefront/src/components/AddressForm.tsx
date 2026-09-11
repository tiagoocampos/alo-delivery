import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Address, AddressPayload } from "@/types"

const addressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(1, "A rua é obrigatória"),
  number: z.string().min(1, "O número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  isDefault: z.boolean().optional(),
})

type AddressFormValues = z.infer<typeof addressSchema>

interface AddressFormProps {
  initialValues?: Address
  onSubmit: (values: AddressPayload) => void
  onCancel: () => void
  isSubmitting: boolean
}

export function AddressForm({ initialValues, onSubmit, onCancel, isSubmitting }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: initialValues?.label ?? "",
      street: initialValues?.street ?? "",
      number: initialValues?.number ?? "",
      complement: initialValues?.complement ?? "",
      neighborhood: initialValues?.neighborhood ?? "",
      city: initialValues?.city ?? "",
      isDefault: initialValues?.isDefault ?? false,
    },
  })

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values))}
      className="flex flex-col gap-3 rounded-xl border border-border p-3"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="label">Apelido (opcional)</Label>
        <Input id="label" {...register("label")} placeholder="Casa, trabalho..." />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="street">Rua</Label>
          <Input id="street" {...register("street")} placeholder="Rua das Flores" />
          {errors.street && <span className="text-xs text-destructive">{errors.street.message}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="number">Número</Label>
          <Input id="number" {...register("number")} placeholder="123" />
          {errors.number && <span className="text-xs text-destructive">{errors.number.message}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="complement">Complemento (opcional)</Label>
        <Input id="complement" {...register("complement")} placeholder="Apto, bloco..." />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="neighborhood">Bairro (opcional)</Label>
          <Input id="neighborhood" {...register("neighborhood")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">Cidade (opcional)</Label>
          <Input id="city" {...register("city")} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" className="size-4 accent-primary" {...register("isDefault")} />
        Usar como endereço padrão
      </label>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Salvando..." : "Salvar endereço"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
