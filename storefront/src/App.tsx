import { Route, Routes } from "react-router-dom"
import { StorefrontPage } from "@/pages/StorefrontPage"
import { InstallAppPage } from "@/pages/InstallAppPage"
import { FindStorePage } from "@/pages/FindStorePage"
import { NotFoundPage } from "@/pages/NotFoundPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<FindStorePage />} />
      <Route path="/:slug/instalar" element={<InstallAppPage />} />
      <Route path="/:slug" element={<StorefrontPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
