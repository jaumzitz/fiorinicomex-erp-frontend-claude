import { createContext, useContext, useState, type ReactNode } from 'react'

import { empresasCadastradas as empresasIniciais } from '@/data/mock-data'
import type { ContatoEmpresa, EmpresaCadastrada } from '@/types/domain'

interface EmpresasCadastradasContextValue {
  empresas: EmpresaCadastrada[]
  criarEmpresa: (dados: {
    nomeFantasia: string
    razaoSocial: string
    cnpj: string
  }) => EmpresaCadastrada
  atualizarEmpresa: (id: string, patch: Partial<EmpresaCadastrada>) => void
  adicionarContato: (empresaId: string) => void
  atualizarContato: (empresaId: string, contatoId: string, patch: Partial<ContatoEmpresa>) => void
  removerContato: (empresaId: string, contatoId: string) => void
}

const EmpresasCadastradasContext = createContext<EmpresasCadastradasContextValue | null>(null)

export function EmpresasCadastradasProvider({ children }: { children: ReactNode }) {
  const [empresas, setEmpresas] = useState<EmpresaCadastrada[]>(empresasIniciais)

  function criarEmpresa(dados: { nomeFantasia: string; razaoSocial: string; cnpj: string }) {
    const nova: EmpresaCadastrada = {
      id: crypto.randomUUID(),
      contatos: [],
      ...dados,
    }
    setEmpresas((atual) => [nova, ...atual])
    return nova
  }

  function atualizarEmpresa(id: string, patch: Partial<EmpresaCadastrada>) {
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
