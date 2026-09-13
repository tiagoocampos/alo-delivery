import { useState, type FormEvent } from "react"
import { Award } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getLoyaltyPoints } from "@/services/storefront"
import { formatPhoneInput } from "@/lib/phone"
import type { LoyaltyInfo } from "@/types"

interface LoyaltySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: string
}

export function LoyaltySheet({ open, onOpenChange, slug }: LoyaltySheetProps) {
  const [phone, setPhone] = useState("")
  const [result, setResult] = useState<LoyaltyInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setResult(null)
      setPhone("")
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (phone.trim().length < 8) return

    setIsLoading(true)
    try {
      const data = await getLoyaltyPoints(slug, phone.trim())
      setResult(data)
    } catch {
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Programa de fidelidade</SheetTitle>
          <SheetDescription>Consulte seus pontos informando o telefone usado nos pedidos.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="loyaltyPhone">Telefone</Label>
            <Input
              id="loyaltyPhone"
              value={phone}
              onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
              placeholder="(00) 00000-0000"
            />
          </div>

          <Button type="submit" disabled={isLoading || phone.trim().length < 8}>
            {isLoading ? "Consultando..." : "Consultar pontos"}
          </Button>

          {result && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <Award className="size-8 text-primary" />
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-foreground">{result.points} pontos</span>
                <span className="text-xs text-muted-foreground">
                  {result.updatedAt
                    ? `Atualizado em ${new Date(result.updatedAt).toLocaleDateString("pt-BR")}`
                    : "Nenhum ponto acumulado ainda"}
                </span>
              </div>
            </div>
          )}
        </form>
      </SheetContent>
    </Sheet>
  )
}
