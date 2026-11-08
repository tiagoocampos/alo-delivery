import { useEffect, useState } from "react"
import { loadFonts } from "@/lib/fonts"

export function useFontsReady(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    loadFonts().then(() => {
      if (active) setReady(true)
    })

    return () => {
      active = false
    }
  }, [])

  return ready
}
