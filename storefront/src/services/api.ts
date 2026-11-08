import axios, { AxiosError } from "axios"
import { toast } from "sonner"

declare module "axios" {
  interface AxiosRequestConfig {
    // Quem chama trata o erro por conta própria (toast amigável ou silêncio).
    silent?: boolean
  }
}

interface ValidationErrorBody {
  error: string
  details?: { message: string; path: string }[]
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API,
})

function extractErrorMessage(error: AxiosError<ValidationErrorBody>): string {
  const data = error.response?.data

  if (data?.details && data.details.length > 0) {
    return data.details[0].message
  }

  if (data?.error) {
    return data.error
  }

  return "Não foi possível completar a ação. Tente novamente."
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ValidationErrorBody>) => {
    if (!error.config?.silent) toast.error(extractErrorMessage(error))
    return Promise.reject(error)
  }
)
