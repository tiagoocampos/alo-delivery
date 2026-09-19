import type { Tenant } from "@/types"

// Fonte única do que cada tela pode mostrar como marca do lojista. Plano
// básico nunca usa logo/banner reais do tenant, mesmo que estejam salvos no
// banco — qualquer tela que precise exibir a marca da loja deve ler daqui,
// nunca de tenant.logoUrl/tenant.bannerUrl diretamente.
export function getStoreBranding(tenant: Tenant) {
  const isBasico = tenant.effectivePlan === "basico"

  return {
    isBasico,
    logoUrl: isBasico ? null : tenant.logoUrl,
    bannerUrl: isBasico ? null : tenant.bannerUrl,
  }
}
