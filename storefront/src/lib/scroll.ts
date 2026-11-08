// Rola até um elemento respeitando "reduzir movimento" do sistema.
export function scrollToId(id: string) {
  const target = document.getElementById(id)
  if (!target) return

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
}
