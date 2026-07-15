import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { ProcessosProvider } from '@/store/ProcessosContext'
import { EmpresaProvider } from '@/store/EmpresaContext'
import Welcome from '@/routes/Welcome'
import ProcessosImportacao from '@/routes/ProcessosImportacao'
import BI from '@/routes/BI'
import Admin from '@/routes/Admin'

function App() {
  return (
    <EmpresaProvider>
      <ProcessosProvider>
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
      </ProcessosProvider>
    </EmpresaProvider>
  )
}

export default App
