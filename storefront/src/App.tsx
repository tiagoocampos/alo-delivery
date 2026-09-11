import { Route, Routes } from "react-router-dom"
import { StorefrontPage } from "@/pages/StorefrontPage"
import { NotFoundPage } from "@/pages/NotFoundPage"

function App() {
  return (
    <Routes>
      <Route path="/:slug" element={<StorefrontPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
