import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import Welcome from '@/routes/Welcome'
import ProcessosImportacao from '@/routes/ProcessosImportacao'
import BI from '@/routes/BI'
import Admin from '@/routes/Admin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Welcome />} />
          <Route path="processos" element={<ProcessosImportacao />} />
          <Route path="bi" element={<BI />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
