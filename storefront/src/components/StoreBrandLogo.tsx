const ALO_DELIVERY_LANDING_URL = import.meta.env.VITE_ALO_DELIVERY_LANDING_URL

interface StoreBrandLogoProps {
  className?: string
}

// Mostrado no lugar da logo do lojista quando o plano é básico — clicável,
// abre a landing page do Alô Delivery em nova aba.
export function StoreBrandLogo({ className }: StoreBrandLogoProps) {
  return (
    <a href={ALO_DELIVERY_LANDING_URL} target="_blank" rel="noreferrer" aria-label="Conheça o Alô Delivery">
      <img src="/favicon.svg" alt="" className={className} />
    </a>
  )
}
