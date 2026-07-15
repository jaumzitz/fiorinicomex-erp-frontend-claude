import { createContext, useContext, useState, type ReactNode } from 'react'

import { empresaPadrao } from '@/data/mock-data'
import type { Empresa } from '@/types/domain'

interface EmpresaContextValue {
  empresa: Empresa
  atualizarEmpresa: (patch: Partial<Empresa>) => void
}

const EmpresaContext = createContext<EmpresaContextValue | null>(null)

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [empresa, setEmpresa] = useState<Empresa>(empresaPadrao)

  function atualizarEmpresa(patch: Partial<Empresa>) {
    setEmpresa((atual) => ({ ...atual, ...patch }))
  }

  return (
    <EmpresaContext.Provider value={{ empresa, atualizarEmpresa }}>
      {children}
    </EmpresaContext.Provider>
  )
}

export function useEmpresa() {
  const ctx = useContext(EmpresaContext)
  if (!ctx) throw new Error('useEmpresa deve ser usado dentro de EmpresaProvider')
  return ctx
}
