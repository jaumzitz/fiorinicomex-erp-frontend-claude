import { createContext, useContext, useState, type ReactNode } from 'react'

import { empresaConfigPadrao } from '@/data/mock-data'
import type { EmpresaConfig } from '@/types/domain'

interface EmpresaConfigContextValue {
  empresa: EmpresaConfig
  atualizarEmpresa: (patch: Partial<EmpresaConfig>) => void
}

const EmpresaConfigContext = createContext<EmpresaConfigContextValue | null>(null)

export function EmpresaConfigProvider({ children }: { children: ReactNode }) {
  const [empresa, setEmpresa] = useState<EmpresaConfig>(empresaConfigPadrao)

  function atualizarEmpresa(patch: Partial<EmpresaConfig>) {
    setEmpresa((atual) => ({ ...atual, ...patch }))
  }

  return (
    <EmpresaConfigContext.Provider value={{ empresa, atualizarEmpresa }}>
      {children}
    </EmpresaConfigContext.Provider>
  )
}

export function useEmpresaConfig() {
  const ctx = useContext(EmpresaConfigContext)
  if (!ctx) throw new Error('useEmpresaConfig deve ser usado dentro de EmpresaConfigProvider')
  return ctx
}
