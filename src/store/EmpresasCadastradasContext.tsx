import { createContext, useContext, useState, type ReactNode } from 'react'

import { empresas as empresasIniciais } from '@/data/mock-data'
import type { ContatoEmpresa, Empresa, TipoRelacionamentoEmpresa } from '@/types/domain'

interface EmpresasCadastradasContextValue {
  empresas: Empresa[]
  criarEmpresa: (dados: {
    nomeFantasia: string
    razaoSocial: string
    tiposRelacionamento: TipoRelacionamentoEmpresa[]
    estrangeira: boolean
    cnpj?: string
  }) => Empresa
  atualizarEmpresa: (id: string, patch: Partial<Empresa>) => void
  adicionarContato: (empresaId: string) => void
  atualizarContato: (empresaId: string, contatoId: string, patch: Partial<ContatoEmpresa>) => void
  removerContato: (empresaId: string, contatoId: string) => void
}

const EmpresasCadastradasContext = createContext<EmpresasCadastradasContextValue | null>(null)

export function EmpresasCadastradasProvider({ children }: { children: ReactNode }) {
  const [empresas, setEmpresas] = useState<Empresa[]>(empresasIniciais)

  function criarEmpresa(dados: {
    nomeFantasia: string
    razaoSocial: string
    tiposRelacionamento: TipoRelacionamentoEmpresa[]
    estrangeira: boolean
    cnpj?: string
  }) {
    const nova: Empresa = {
      id: crypto.randomUUID(),
      contatos: [],
      ...dados,
    }
    setEmpresas((atual) => [nova, ...atual])
    return nova
  }

  function atualizarEmpresa(id: string, patch: Partial<Empresa>) {
    setEmpresas((atual) => atual.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  function adicionarContato(empresaId: string) {
    setEmpresas((atual) =>
      atual.map((e) =>
        e.id === empresaId
          ? { ...e, contatos: [...e.contatos, { id: crypto.randomUUID(), nome: '' }] }
          : e,
      ),
    )
  }

  function atualizarContato(empresaId: string, contatoId: string, patch: Partial<ContatoEmpresa>) {
    setEmpresas((atual) =>
      atual.map((e) =>
        e.id === empresaId
          ? {
              ...e,
              contatos: e.contatos.map((c) => (c.id === contatoId ? { ...c, ...patch } : c)),
            }
          : e,
      ),
    )
  }

  function removerContato(empresaId: string, contatoId: string) {
    setEmpresas((atual) =>
      atual.map((e) =>
        e.id === empresaId
          ? { ...e, contatos: e.contatos.filter((c) => c.id !== contatoId) }
          : e,
      ),
    )
  }

  return (
    <EmpresasCadastradasContext.Provider
      value={{
        empresas,
        criarEmpresa,
        atualizarEmpresa,
        adicionarContato,
        atualizarContato,
        removerContato,
      }}
    >
      {children}
    </EmpresasCadastradasContext.Provider>
  )
}

export function useEmpresasCadastradas() {
  const ctx = useContext(EmpresasCadastradasContext)
  if (!ctx) {
    throw new Error('useEmpresasCadastradas deve ser usado dentro de EmpresasCadastradasProvider')
  }
  return ctx
}
