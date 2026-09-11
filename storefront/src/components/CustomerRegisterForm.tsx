import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { RegisterCustomerPayload } from "@/types"

const registerSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  phone: z.string().min(8, "Telefone inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

interface CustomerRegisterFormProps {
  onSubmit: (values: RegisterCustomerPayload) => Promise<void>
}

export function CustomerRegisterForm({ onSubmit }: CustomerRegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  const submit = (values: RegisterFormValues) =>
    onSubmit({ ...values, email: values.email || undefined })

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="registerName">Nome</Label>
        <Input id="registerName" {...register("name")} placeholder="Seu nome" />
        {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="registerPhone">Telefone</Label>
        <Input id="registerPhone" {...register("phone")} placeholder="(00) 00000-0000" />
        {errors.phone && <span className="text-xs text-destructive">{errors.phone.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="registerEmail">E-mail (opcional)</Label>
        <Input id="registerEmail" type="email" {...register("email")} placeholder="voce@email.com" />
        {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="registerPassword">Senha</Label>
        <Input id="registerPassword" type="password" {...register("password")} placeholder="Mínimo 6 caracteres" />
        {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  )
}
