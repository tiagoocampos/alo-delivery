// Máscara de telefone brasileiro enquanto o cliente digita — o backend aceita
// tanto o valor mascarado quanto só dígitos, então isso é só experiência de
// digitação, não validação (a validação real mora no schema do backend).
export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)

  if (digits.length === 0) return ""
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// Só dígitos, já com o código do país (55) para links wa.me / tel:. Devolve
// null quando o número não parece um telefone brasileiro válido.
export function toInternationalPhone(value: string | null | undefined): string | null {
  if (!value) return null

  const digits = value.replace(/\D/g, "")
  if (digits.length === 10 || digits.length === 11) return `55${digits}`
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) return digits

  return null
}
