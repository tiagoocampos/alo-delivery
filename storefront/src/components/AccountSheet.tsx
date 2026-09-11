import { useEffect, useState } from "react"
import { toast } from "sonner"
import { LogOut, Mail, MapPin, Pencil, Phone, Plus, Star, Trash2, User } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AddressForm } from "@/components/AddressForm"
import { CustomerLoginForm } from "@/components/CustomerLoginForm"
import { CustomerRegisterForm } from "@/components/CustomerRegisterForm"
import { formatAddressLine } from "@/lib/address"
import { cn } from "@/lib/utils"
import { useCustomerAuth } from "@/hooks/useCustomerAuth"
import { createAddress, deleteAddress, listAddresses, updateAddress } from "@/services/customer"
import type { Address, AddressPayload } from "@/types"

interface AccountSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: string
}

export function AccountSheet({ open, onOpenChange, slug }: AccountSheetProps) {
  const { customer, isAuthenticated, login, register, logout } = useCustomerAuth()
  const [authMode, setAuthMode] = useState<"login" | "register">("login")

  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | "new" | null>(null)
  const [isSavingAddress, setIsSavingAddress] = useState(false)

  useEffect(() => {
    if (!open || !isAuthenticated) return

    setAddressesLoading(true)
    listAddresses(slug)
      .then(setAddresses)
      .catch(() => {})
      .finally(() => setAddressesLoading(false))
  }, [open, isAuthenticated, slug])

  const handleLogin = async (values: { phone: string; password: string }) => {
    try {
      await login(values)
      toast.success("Login realizado")
    } catch {
      // toast de erro já disparado pelo interceptor do axios
    }
  }

  const handleRegister = async (values: { name: string; phone: string; email?: string; password: string }) => {
    try {
      await register(values)
      toast.success("Conta criada com sucesso")
    } catch {
      // toast de erro já disparado pelo interceptor do axios
    }
  }

  const handleSaveAddress = async (values: AddressPayload) => {
    setIsSavingAddress(true)
    try {
      if (editingAddress && editingAddress !== "new") {
        const updated = await updateAddress(slug, editingAddress.id, values)
        setAddresses((current) => current.map((a) => (a.id === updated.id ? updated : a)))
      } else {
        const created = await createAddress(slug, values)
        setAddresses((current) => [...current, created])
      }
      setEditingAddress(null)
      toast.success("Endereço salvo")
    } catch {
      // toast de erro já disparado pelo interceptor do axios
    } finally {
      setIsSavingAddress(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await deleteAddress(slug, addressId)
      setAddresses((current) => current.filter((a) => a.id !== addressId))
      toast.success("Endereço removido")
    } catch {
      // toast de erro já disparado pelo interceptor do axios
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isAuthenticated ? "Minha conta" : "Entrar ou criar conta"}</SheetTitle>
        </SheetHeader>

        {!isAuthenticated ? (
          <div className="flex flex-col gap-4 px-4 pb-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  authMode === "login"
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border text-foreground hover:bg-muted"
                )}
              >
                Já tenho conta
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  authMode === "register"
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border text-foreground hover:bg-muted"
                )}
              >
                Criar conta
              </button>
            </div>

            {authMode === "login" ? (
              <CustomerLoginForm onSubmit={handleLogin} />
            ) : (
              <CustomerRegisterForm onSubmit={handleRegister} />
            )}

            <p className="text-center text-xs text-muted-foreground">
              Ter uma conta é opcional — você pode continuar pedindo como convidado.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 px-4 pb-4">
            <div className="flex flex-col gap-1.5 rounded-xl border border-border p-3">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <User className="size-4 text-muted-foreground" />
                {customer?.name}
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4" />
                {customer?.phone}
              </span>
              {customer?.email && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="size-4" />
                  {customer.email}
                </span>
              )}
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Endereços salvos</h3>
                {editingAddress === null && (
                  <Button variant="ghost" size="sm" onClick={() => setEditingAddress("new")}>
                    <Plus /> Adicionar
                  </Button>
                )}
              </div>

              {addressesLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

              {!addressesLoading && addresses.length === 0 && editingAddress === null && (
                <p className="text-sm text-muted-foreground">Nenhum endereço salvo ainda.</p>
              )}

              {!addressesLoading &&
                addresses.map((address) =>
                  editingAddress !== "new" && editingAddress?.id === address.id ? (
                    <AddressForm
                      key={address.id}
                      initialValues={address}
                      onSubmit={handleSaveAddress}
                      onCancel={() => setEditingAddress(null)}
                      isSubmitting={isSavingAddress}
                    />
                  ) : (
                    <div key={address.id} className="flex items-start gap-2 rounded-xl border border-border p-3">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                          {address.label || "Endereço"}
                          {address.isDefault && <Star className="size-3.5 fill-primary text-primary" />}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatAddressLine(address)}</span>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setEditingAddress(address)}
                          aria-label="Editar endereço"
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDeleteAddress(address.id)}
                          aria-label="Excluir endereço"
                        >
                          <Trash2 className="text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )
                )}

              {editingAddress === "new" && (
                <AddressForm
                  onSubmit={handleSaveAddress}
                  onCancel={() => setEditingAddress(null)}
                  isSubmitting={isSavingAddress}
                />
              )}
            </div>

            <Separator />

            <Button variant="outline" onClick={logout} className="w-full">
              <LogOut /> Sair da conta
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
